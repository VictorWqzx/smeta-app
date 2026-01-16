export type Unit = 'м²' | 'м.п.' | 'шт.' | 'час' | 'компл.'

export interface Service {
  id: string
  name: string
  isCustom: boolean
}

export interface EstimateItem {
  id: string
  serviceId: string
  serviceName: string
  quantity: number
  unit: Unit
  pricePerUnit: number
  total: number
}

export interface Estimate {
  id: string
  name: string
  items: EstimateItem[]
  total: number
  currency: 'BYN' | 'USD'
  exchangeRate: number
  createdAt: string
  updatedAt: string
}
