import * as XLSX from 'xlsx'
import { Estimate } from '@shared/types'

export function exportEstimateToExcel(estimate: Estimate) {
  const workbook = XLSX.utils.book_new()

  const currencyLabel = estimate.currency === 'USD' ? 'USD' : 'BYN'
  
  const worksheetData: (string | number)[][] = [
    ['НоваРемонт'],
    [''],
    [estimate.name],
    [''],
    [''],
    ['№', 'Вид работ', 'Количество', 'Ед. изм.', `Цена за ед. (${currencyLabel})`, `Итого (${currencyLabel})`],
  ]

  estimate.items.forEach((item, index) => {
    worksheetData.push([
      index + 1,
      item.serviceName,
      item.quantity,
      item.unit,
      item.pricePerUnit,
      item.total,
    ])
  })

  worksheetData.push([''])
  worksheetData.push([`ИТОГО (${currencyLabel}):`, '', '', '', '', estimate.total])
  
  if (estimate.currency === 'USD') {
    worksheetData.push([''])
    worksheetData.push(['Курс обмена:', `1 USD = ${estimate.exchangeRate} BYN`, '', '', '', ''])
    worksheetData.push([`ИТОГО (BYN):`, '', '', '', '', estimate.total * estimate.exchangeRate])
  }

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
  
  // Определяем номера строк для итоговых значений
  const headerRow = 5 // строка с заголовками (0-indexed)
  const totalRow = headerRow + estimate.items.length + 2 // строка "ИТОГО (валюта):"
  const totalBynRow = estimate.currency === 'USD' ? totalRow + 3 : null // строка "ИТОГО (BYN):" если есть
  
  // Выравниваем все ячейки
  Object.keys(worksheet).forEach((cellAddress) => {
    if (cellAddress.startsWith('!')) return

    const cell = worksheet[cellAddress]
    const cellRef = XLSX.utils.decode_cell(cellAddress)
    const rowNum = cellRef.r
    
    // Для итоговых строк делаем жирный шрифт и выравнивание
    if (rowNum === totalRow || (totalBynRow && rowNum === totalBynRow)) {
      cell.s = {
        alignment: {
          horizontal: cellRef.c === 0 ? 'left' : 'right', // текст слева, числа справа
          vertical: 'center',
        },
        font: {
          bold: true,
        },
      }
    } else {
      cell.s = {
        alignment: {
          horizontal: 'center',
          vertical: 'center',
        },
      }
    }
  })

  const maxWidths = [5, 30, 12, 10, 12, 15]
  worksheet['!cols'] = maxWidths.map((w) => ({ wch: w }))

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Смета')

  const fileName = `${estimate.name.replace(/[^a-zа-яё0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

