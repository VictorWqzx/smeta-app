import * as XLSX from 'xlsx'
import { Estimate } from '@shared/types'

export function exportEstimateToExcel(estimate: Estimate) {
  const workbook = XLSX.utils.book_new()

  const worksheetData: (string | number)[][] = [
    ['СМЕТА НОВА РЕМОНТ'],
    [''],
    ['Название сметы:', estimate.name],
    ['Дата создания:', new Date(estimate.createdAt).toLocaleDateString('ru-RU')],
    ['Дата обновления:', new Date(estimate.updatedAt).toLocaleDateString('ru-RU')],
    [''],
    ['Позиции сметы:'],
    [''],
    ['№', 'Услуга', 'Количество', 'Ед. изм.', 'Цена за ед.', 'Итого'],
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
  worksheetData.push(['ИТОГО:', '', '', '', '', estimate.total])

  if (estimate.currency === 'USD') {
    worksheetData.push(['Курс обмена:', `1 USD = ${estimate.exchangeRate} BYN`])
    worksheetData.push(['Итого в USD:', '', '', '', '', estimate.total / estimate.exchangeRate])
  }

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  const maxWidths = [5, 30, 12, 10, 12, 15]
  worksheet['!cols'] = maxWidths.map((w) => ({ wch: w }))

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Смета')

  const fileName = `${estimate.name.replace(/[^a-zа-яё0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}
