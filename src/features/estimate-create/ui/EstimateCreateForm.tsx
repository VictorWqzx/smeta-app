import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { EstimateItem, Unit } from '@shared/types'
import { estimateStore } from '@entities/estimate/model/estimateStore'
import { serviceStore } from '@entities/service/model/serviceStore'
import { storage } from '@shared/lib/storage'
import { formatCurrency, generateId } from '@shared/lib/utils'
import { UNITS } from '@shared/constants/units'
import './EstimateCreateForm.css'

export function EstimateCreateForm() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [items, setItems] = useState<EstimateItem[]>([])
  const [currency, setCurrency] = useState<'BYN' | 'USD'>('BYN')
  const [exchangeRate, setExchangeRate] = useState(storage.getExchangeRate())
  const [previousCurrency, setPreviousCurrency] = useState<'BYN' | 'USD'>('BYN')

  const total = items.reduce((sum: number, item: EstimateItem) => sum + item.total, 0)

  const addItem = () => {
    const newItem: EstimateItem = {
      id: generateId(),
      serviceId: '',
      serviceName: '',
      quantity: 0,
      unit: 'м²',
      pricePerUnit: 0,
      total: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item: EstimateItem) => item.id !== id))
  }

  const updateItem = (id: string, updates: Partial<EstimateItem>) => {
    setItems(
      items.map((item: EstimateItem) => {
        if (item.id !== id) return item
        const updated = { ...item, ...updates }
        if (updated.quantity !== undefined || updated.pricePerUnit !== undefined) {
          updated.total = (updated.quantity || 0) * (updated.pricePerUnit || 0)
        }
        return updated
      })
    )
  }

  // Конвертация валют при переключении
  useEffect(() => {
    if (currency !== previousCurrency && items.length > 0) {
      setItems(
        items.map((item) => {
          let newPricePerUnit = item.pricePerUnit
          
          if (previousCurrency === 'BYN' && currency === 'USD') {
            // Конвертируем из BYN в USD
            newPricePerUnit = item.pricePerUnit / exchangeRate
          } else if (previousCurrency === 'USD' && currency === 'BYN') {
            // Конвертируем из USD в BYN
            newPricePerUnit = item.pricePerUnit * exchangeRate
          }
          
          return {
            ...item,
            pricePerUnit: newPricePerUnit,
            total: (item.quantity || 0) * newPricePerUnit,
          }
        })
      )
    }
    setPreviousCurrency(currency)
  }, [currency, exchangeRate])

  const handleSave = () => {
    if (!name.trim()) {
      alert('Введите название сметы')
      return
    }

    if (items.length === 0) {
      alert('Добавьте хотя бы одну позицию')
      return
    }

    estimateStore.create({
      name: name.trim(),
      items,
      total,
      currency,
      exchangeRate,
    })

    navigate('/')
  }

  useEffect(() => {
    storage.saveExchangeRate(exchangeRate)
  }, [exchangeRate])

  return (
    <div className="estimate-form">
      <div className="estimate-form__header">
        <h1>Создать новую смету</h1>
        <div className="estimate-form__controls">
          <div className="estimate-form__currency-controls">
            <label>
              Валюта:
              <select
                value={currency}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const newCurrency = e.target.value as 'BYN' | 'USD'
                  setPreviousCurrency(currency)
                  setCurrency(newCurrency)
                }}
              >
                <option value="BYN">BYN</option>
                <option value="USD">USD</option>
              </select>
            </label>
            {currency === 'USD' && (
              <label>
                Курс (1 USD = ? BYN):
                <input
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExchangeRate(parseFloat(e.target.value) || 3.3)}
                  min="0.01"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="estimate-form__name">
        <label>
          Название сметы:
          <input
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Например: Ремонт квартиры на ул. Ленина, 10"
          />
        </label>
      </div>

      <div className="estimate-form__items">
        <div className="estimate-form__items-header">
          <h2>Позиции сметы</h2>
          <button onClick={addItem} className="btn btn-primary">
            + Добавить позицию
          </button>
        </div>

        {items.length === 0 ? (
          <p className="estimate-form__empty">Добавьте первую позицию в смету</p>
        ) : (
          <table className="estimate-form__table">
            <thead>
              <tr>
                <th>Услуга</th>
                <th>Количество</th>
                <th>Ед. изм.</th>
                <th>Цена за ед.</th>
                <th>Итого</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: EstimateItem) => (
                <EstimateItemRow
                  key={item.id}
                  item={item}
                  currency={currency}
                  onUpdate={(updates) => updateItem(item.id, updates)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="estimate-form__footer">
        <div className="estimate-form__total">
          <strong>
            Итого: {formatCurrency(total, currency)}
          </strong>
        </div>
        <div className="estimate-form__actions">
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            Отмена
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Сохранить смету
          </button>
        </div>
      </div>
    </div>
  )
}

interface EstimateItemRowProps {
  item: EstimateItem
  currency: 'BYN' | 'USD'
  onUpdate: (updates: Partial<EstimateItem>) => void
  onRemove: () => void
}

function EstimateItemRow({ item, currency, onUpdate, onRemove }: EstimateItemRowProps) {
  const [serviceSearch, setServiceSearch] = useState(item.serviceName || '')
  const [showServiceDropdown, setShowServiceDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const services = serviceStore.search(serviceSearch)
  const [newServiceName, setNewServiceName] = useState('')
  const [showAddService, setShowAddService] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleServiceSelect = (serviceId: string, serviceName: string) => {
    onUpdate({ serviceId, serviceName })
    setServiceSearch(serviceName)
    setShowServiceDropdown(false)
  }

  const handleAddService = () => {
    if (newServiceName.trim()) {
      const newService = serviceStore.add(newServiceName.trim())
      handleServiceSelect(newService.id, newService.name)
      setNewServiceName('')
      setShowAddService(false)
    }
  }

  const handleQuantityChange = (value: string) => {
    const quantity = parseFloat(value) || 0
    onUpdate({ quantity })
  }

  const handlePriceChange = (value: string) => {
    const pricePerUnit = parseFloat(value) || 0
    onUpdate({ pricePerUnit })
  }

  useEffect(() => {
    if (showServiceDropdown && selectRef.current && dropdownRef.current) {
      const rect = selectRef.current.getBoundingClientRect()
      const dropdownHeight = 280
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      
      let top = rect.bottom + 8
      let left = rect.left
      
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        top = rect.top - dropdownHeight - 8
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
      
      // Проверяем границы экрана
      if (left + 300 > window.innerWidth) {
        left = window.innerWidth - 320
      }
      if (left < 8) left = 8
      
      dropdownRef.current.style.top = `${top}px`
      dropdownRef.current.style.left = `${left}px`
      dropdownRef.current.style.width = `${Math.min(rect.width, 300)}px`
    }
  }, [showServiceDropdown, serviceSearch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowServiceDropdown(false)
      }
    }

    if (showServiceDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showServiceDropdown])

  return (
    <tr>
      <td>
        <div className="service-select" ref={selectRef}>
          <input
            type="text"
            value={serviceSearch}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setServiceSearch(e.target.value)
              setShowServiceDropdown(true)
              if (e.target.value === '') {
                onUpdate({ serviceId: '', serviceName: '' })
              }
            }}
            onFocus={() => {
              if (!serviceSearch && item.serviceName) {
                setServiceSearch(item.serviceName)
              }
              setShowServiceDropdown(true)
            }}
            placeholder="Выберите или введите услугу"
            className="service-select__input"
          />
          {showServiceDropdown && (
            <div
              ref={dropdownRef}
              className={`service-select__dropdown service-select__dropdown--${dropdownPosition}`}
            >
              {services.length > 0 ? (
                <>
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="service-select__option"
                      onClick={() => handleServiceSelect(service.id, service.name)}
                    >
                      {service.name}
                    </div>
                  ))}
                </>
              ) : (
                <div className="service-select__no-results">
                  Услуга не найдена
                </div>
              )}
              {!showAddService ? (
                <div
                  className="service-select__add"
                  onClick={() => setShowAddService(true)}
                >
                  + Добавить новую услугу
                </div>
              ) : (
                <div className="service-select__add-form">
                  <input
                    type="text"
                    value={newServiceName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewServiceName(e.target.value)}
                    placeholder="Название услуги"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        handleAddService()
                      } else if (e.key === 'Escape') {
                        setShowAddService(false)
                      }
                    }}
                    autoFocus
                  />
                  <button onClick={handleAddService}>Добавить</button>
                  <button onClick={() => setShowAddService(false)}>Отмена</button>
                </div>
              )}
            </div>
          )}
        </div>
      </td>
      <td>
        <input
          type="number"
          step="0.01"
          value={item.quantity || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQuantityChange(e.target.value)}
          min="0"
          className="input-number"
        />
      </td>
      <td>
        <select
          value={item.unit}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ unit: e.target.value as Unit })}
        >
          {UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input
          type="number"
          step="0.01"
          value={item.pricePerUnit || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e.target.value)}
          min="0"
          className="input-number"
        />
      </td>
      <td>{formatCurrency(item.total, currency)}</td>
      <td>
        <button onClick={onRemove} className="btn btn-danger btn-sm">
          ×
        </button>
      </td>
    </tr>
  )
}
