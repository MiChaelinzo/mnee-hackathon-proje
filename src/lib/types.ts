export interface Service {
  id: string
  name: string
  description: string
  category: ServiceCategory
  price: number
  provider: string
  providerAddress: string
  available: boolean
  sales: number
  rating: number
}

export type ServiceCategory = 
  | 'Data Analysis'
  | 'Content Generation'
  | 'API Access'
  | 'Compute Resources'
  | 'Machine Learning'
  | 'Image Processing'

export interface Agent {
  id: string
  name: string
  address: string
  balance: number
  isActive: boolean
  spendingLimit: number
  totalSpent: number
  purchaseCount: number
}

export interface Transaction {
  id: string
  agentId: string
  agentName: string
  serviceId: string
  serviceName: string
  amount: number
  timestamp: number
  status: 'completed' | 'pending' | 'failed'
  txHash?: string
}
