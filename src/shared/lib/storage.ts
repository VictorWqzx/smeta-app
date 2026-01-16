const STORAGE_KEYS = {
  ESTIMATES: 'estimates',
  SERVICES: 'services',
  EXCHANGE_RATE: 'exchangeRate',
} as const

export const storage = {
  getEstimates: (): any[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ESTIMATES)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  saveEstimates: (estimates: any[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(estimates))
    } catch (error) {
      console.error('Failed to save estimates:', error)
    }
  },

  getServices: (): any[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SERVICES)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  saveServices: (services: any[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services))
    } catch (error) {
      console.error('Failed to save services:', error)
    }
  },

  getExchangeRate: (): number => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATE)
      return data ? parseFloat(data) : 3.3
    } catch {
      return 3.3
    }
  },

  saveExchangeRate: (rate: number) => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXCHANGE_RATE, rate.toString())
    } catch (error) {
      console.error('Failed to save exchange rate:', error)
    }
  },
}
