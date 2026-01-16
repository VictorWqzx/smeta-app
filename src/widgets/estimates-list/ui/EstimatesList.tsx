import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Estimate } from '@shared/types'
import { estimateStore } from '@entities/estimate/model/estimateStore'
import { exportEstimateToExcel } from '@features/estimate-export'
import { formatCurrency } from '@shared/lib/utils'
import './EstimatesList.css'

export function EstimatesList() {
  const navigate = useNavigate()
  const [estimates, setEstimates] = useState<Estimate[]>([])

  useEffect(() => {
    setEstimates(estimateStore.getAll())
  }, [])

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту смету?')) {
      estimateStore.delete(id)
      setEstimates(estimateStore.getAll())
    }
  }

  const handleExport = (estimate: Estimate) => {
    exportEstimateToExcel(estimate)
  }

  const handleDuplicate = (estimate: Estimate) => {
    estimateStore.create({
      name: `${estimate.name} (копия)`,
      items: estimate.items.map((item) => ({ ...item, id: Date.now().toString(36) + Math.random().toString(36).substr(2) })),
      total: estimate.total,
      currency: estimate.currency,
      exchangeRate: estimate.exchangeRate,
    })
    setEstimates(estimateStore.getAll())
  }

  return (
    <div className="estimates-list">
      <div className="estimates-list__header">
        <h1>Мои сметы</h1>
        <button
          onClick={() => navigate('/create')}
          className="btn btn-primary"
        >
          + Создать новую смету
        </button>
      </div>

      {estimates.length === 0 ? (
        <div className="estimates-list__empty">
          <p>У вас пока нет сохраненных смет</p>
          <button
            onClick={() => navigate('/create')}
            className="btn btn-primary"
          >
            Создать первую смету
          </button>
        </div>
      ) : (
        <div className="estimates-list__grid">
          {estimates.map((estimate) => (
            <div key={estimate.id} className="estimate-card">
              <div className="estimate-card__header">
                <h3 className="estimate-card__title">{estimate.name}</h3>
                <div className="estimate-card__date">
                  {new Date(estimate.updatedAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
              <div className="estimate-card__info">
                <div className="estimate-card__items-count">
                  Позиций: {estimate.items.length}
                </div>
                <div className="estimate-card__total">
                  Итого: {formatCurrency(
                    estimate.currency === 'USD'
                      ? estimate.total / estimate.exchangeRate
                      : estimate.total,
                    estimate.currency
                  )}
                </div>
              </div>
              <div className="estimate-card__actions">
                <button
                  onClick={() => navigate(`/edit/${estimate.id}`)}
                  className="btn btn-primary btn-sm"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleExport(estimate)}
                  className="btn btn-success btn-sm"
                >
                  Экспорт в Excel
                </button>
                <button
                  onClick={() => handleDuplicate(estimate)}
                  className="btn btn-secondary btn-sm"
                >
                  Дублировать
                </button>
                <button
                  onClick={() => handleDelete(estimate.id)}
                  className="btn btn-danger btn-sm"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
