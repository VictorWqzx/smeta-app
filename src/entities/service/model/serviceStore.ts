import { Service } from '@shared/types'
import { DEFAULT_SERVICES } from '@shared/constants/services'
import { storage } from '@shared/lib/storage'
import { generateId } from '@shared/lib/utils'

class ServiceStore {
  private services: Service[] = []

  constructor() {
    this.loadServices()
  }

  loadServices() {
    const saved = storage.getServices()
    if (saved.length > 0) {
      this.services = saved
    } else {
      this.services = [...DEFAULT_SERVICES]
      this.saveServices()
    }
  }

  saveServices() {
    storage.saveServices(this.services)
  }

  getAll(): Service[] {
    return [...this.services]
  }

  search(query: string): Service[] {
    const lowerQuery = query.toLowerCase()
    return this.services.filter((service) =>
      service.name.toLowerCase().includes(lowerQuery)
    )
  }

  add(name: string): Service {
    const newService: Service = {
      id: generateId(),
      name: name.trim(),
      isCustom: true,
    }
    this.services.push(newService)
    this.saveServices()
    return newService
  }

  remove(id: string): boolean {
    const index = this.services.findIndex((s) => s.id === id)
    if (index === -1) return false

    const service = this.services[index]
    if (!service.isCustom) return false

    this.services.splice(index, 1)
    this.saveServices()
    return true
  }
}

export const serviceStore = new ServiceStore()
