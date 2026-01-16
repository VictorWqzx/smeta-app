import { Estimate } from '@shared/types'
import { storage } from '@shared/lib/storage'
import { generateId } from '@shared/lib/utils'

class EstimateStore {
  private estimates: Estimate[] = []

  constructor() {
    this.loadEstimates()
  }

  loadEstimates() {
    this.estimates = storage.getEstimates()
  }

  saveEstimates() {
    storage.saveEstimates(this.estimates)
  }

  getAll(): Estimate[] {
    return [...this.estimates]
  }

  getById(id: string): Estimate | undefined {
    return this.estimates.find((e) => e.id === id)
  }

  create(estimate: Omit<Estimate, 'id' | 'createdAt' | 'updatedAt'>): Estimate {
    const newEstimate: Estimate = {
      ...estimate,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.estimates.push(newEstimate)
    this.saveEstimates()
    return newEstimate
  }

  update(id: string, updates: Partial<Estimate>): Estimate | null {
    const index = this.estimates.findIndex((e) => e.id === id)
    if (index === -1) return null

    this.estimates[index] = {
      ...this.estimates[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.saveEstimates()
    return this.estimates[index]
  }

  delete(id: string): boolean {
    const index = this.estimates.findIndex((e) => e.id === id)
    if (index === -1) return false

    this.estimates.splice(index, 1)
    this.saveEstimates()
    return true
  }
}

export const estimateStore = new EstimateStore()
