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

export interface ServiceReview {
  id: string
  serviceId: string
  agentId: string
  agentName: string
  rating: number
  comment: string
  timestamp: number
  helpful: number
}

export interface AgentReputation {
  agentId: string
  trustScore: number
  totalPurchases: number
  totalSpent: number
  reviewsGiven: number
  accountAge: number
  badges: ReputationBadge[]
}

export type ReputationBadge = 
  | 'early-adopter'
  | 'big-spender'
  | 'frequent-buyer'
  | 'helpful-reviewer'
  | 'verified-agent'
  | 'trusted-trader'

export interface Notification {
  id: string
  type: 'purchase' | 'review' | 'balance' | 'service' | 'system'
  title: string
  message: string
  timestamp: number
  read: boolean
  actionUrl?: string
}

export interface ProviderStats {
  providerId: string
  providerName: string
  totalRevenue: number
  totalSales: number
  averageRating: number
  totalReviews: number
  topService: string
  servicesCount: number
}

export interface ChatConversation {
  id: string
  participantType: 'agent' | 'provider'
  participantId: string
  participantName: string
  participantAddress: string
  serviceId?: string
  serviceName?: string
  lastMessage: string
  lastMessageTime: number
  unreadCount: number
  status: 'active' | 'resolved' | 'archived'
  topic: ChatTopic
}

export type ChatTopic = 
  | 'general-inquiry'
  | 'technical-support'
  | 'pricing-negotiation'
  | 'custom-service'
  | 'issue-resolution'
  | 'feedback'

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderType: 'agent' | 'provider'
  message: string
  timestamp: number
  attachments?: ChatAttachment[]
  isSystem?: boolean
  offerDetails?: NegotiationOffer
}

export interface ChatAttachment {
  id: string
  type: 'image' | 'document' | 'code' | 'transaction'
  name: string
  url: string
  size?: number
}

export interface NegotiationOffer {
  offerId: string
  serviceId: string
  serviceName: string
  originalPrice: number
  offeredPrice: number
  customTerms?: string
  expiresAt: number
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired'
}
