import { Estimate } from '@shared/types'

export interface EstimateState {
  estimates: Estimate[]
  currentEstimate: Estimate | null
  isLoading: boolean
}
