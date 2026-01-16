export function formatCurrency(amount: number, currency: 'BYN' | 'USD'): string {
  const formatted = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  const symbol = currency === 'BYN' ? 'Br' : '$'
  return `${formatted} ${symbol}`
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
