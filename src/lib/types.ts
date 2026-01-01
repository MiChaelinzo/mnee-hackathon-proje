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
  type?: 'service' | 'bundle' | 'subscription'
  bundleId?: string
  subscriptionId?: string
}

export interface ServiceBundle {
  id: string
  name: string
  description: string
  services: string[]
  originalPrice: number
  bundlePrice: number
  discount: number
  category: ServiceCategory
  provider: string
  providerAddress: string
  available: boolean
  sales: number
  rating: number
  validityDays?: number
}

export interface Subscription {
  id: string
  name: string
  description: string
  services: string[]
  monthlyPrice: number
  billingPeriod: 'monthly' | 'quarterly' | 'yearly'
  totalPrice: number
  discount: number
  category: ServiceCategory
  provider: string
  providerAddress: string
  available: boolean
  subscribers: number
  rating: number
  features: string[]
}

export interface ActiveSubscription {
  id: string
  subscriptionId: string
  agentId: string
  startDate: number
  endDate: number
  nextBillingDate: number
  status: 'active' | 'cancelled' | 'expired'
  autoRenew: boolean
}
