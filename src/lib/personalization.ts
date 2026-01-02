import type { Agent, Transaction, Service, ServiceReview } from './types'

export interface UserProfile {
  walletAddress: string
  firstVisit: number
  lastVisit: number
  totalVisits: number
  preferences: {
    favoriteCategories: string[]
    priceRange: { min: number; max: number }
    spendingPattern: 'conservative' | 'moderate' | 'aggressive'
  }
  achievements: Achievement[]
  onboardingComplete: boolean
  personalityType: PersonalityType
}

export type Achievement = 
  | 'first-connection'
  | 'first-agent-created'
  | 'first-purchase'
  | 'early-adopter'
  | 'power-user'
  | 'collector'
  | 'reviewer'
  | 'whale'
  | 'explorer'
  | 'loyal-customer'
  | 'service-provider'

export type PersonalityType = 
  | 'newcomer'
  | 'explorer'
  | 'builder'
  | 'trader'
  | 'analyst'
  | 'power-user'

export interface PersonalizedWelcome {
  greeting: string
  message: string
  suggestedActions: SuggestedAction[]
  tips: string[]
  highlights: Highlight[]
  mood: 'welcoming' | 'celebratory' | 'motivational' | 'informative'
}

export interface SuggestedAction {
  id: string
  title: string
  description: string
  icon: string
  action: string
  priority: number
}

export interface Highlight {
  title: string
  description: string
  type: 'achievement' | 'statistic' | 'recommendation' | 'milestone'
}

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours()
  
  if (hour < 5) return 'Burning the midnight oil'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 22) return 'Good evening'
  return 'Working late'
}

export function getWalletBasedPersonality(address: string): string {
  const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const personas = [
    'Strategic Thinker',
    'Innovation Pioneer',
    'Data Enthusiast',
    'Tech Explorer',
    'Efficiency Expert',
    'Creative Visionary',
    'Market Analyst',
    'Growth Hacker',
  ]
  return personas[hash % personas.length]
}

export function analyzeUserBehavior(
  agents: Agent[],
  transactions: Transaction[],
  services: Service[],
  reviews: ServiceReview[]
): PersonalityType {
  const totalTransactions = transactions.length
  const totalAgents = agents.length
  const totalReviews = reviews.length
  
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
  
  if (totalTransactions === 0 && totalAgents === 0) {
    return 'newcomer'
  }
  
  if (totalAgents >= 3 && totalTransactions > 20) {
    return 'power-user'
  }
  
  if (totalReviews > 5 && totalTransactions > 10) {
    return 'analyst'
  }
  
  if (totalSpent > 500 && totalTransactions > 15) {
    return 'trader'
  }
  
  if (totalAgents >= 2 && totalTransactions >= 5) {
    return 'builder'
  }
  
  return 'explorer'
}

export function detectAchievements(
  profile: UserProfile,
  agents: Agent[],
  transactions: Transaction[],
  reviews: ServiceReview[]
): Achievement[] {
  const achievements: Achievement[] = []
  
  if (profile.totalVisits === 1) {
    achievements.push('first-connection')
  }
  
  if (profile.totalVisits > 20) {
    achievements.push('loyal-customer')
  }
  
  if (agents.length > 0 && !profile.achievements.includes('first-agent-created')) {
    achievements.push('first-agent-created')
  }
  
  if (transactions.length > 0 && !profile.achievements.includes('first-purchase')) {
    achievements.push('first-purchase')
  }
  
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
  if (totalSpent > 1000) {
    achievements.push('whale')
  }
  
  if (transactions.length > 50) {
    achievements.push('power-user')
  }
  
  if (reviews.length > 10) {
    achievements.push('reviewer')
  }
  
  const uniqueServices = new Set(transactions.map(t => t.serviceId))
  if (uniqueServices.size > 15) {
    achievements.push('explorer')
  }
  
  const daysSinceFirstVisit = (Date.now() - profile.firstVisit) / (1000 * 60 * 60 * 24)
  if (daysSinceFirstVisit < 7 && transactions.length > 5) {
    achievements.push('early-adopter')
  }
  
  return achievements.filter(a => !profile.achievements.includes(a))
}

export function generatePersonalizedWelcome(
  walletAddress: string | null,
  profile: UserProfile | null,
  agents: Agent[],
  transactions: Transaction[],
  services: Service[],
  reviews: ServiceReview[]
): PersonalizedWelcome {
  const greeting = getTimeBasedGreeting()
  const newAchievements = profile ? detectAchievements(profile, agents, transactions, reviews) : []
  const personalityType = analyzeUserBehavior(agents, transactions, services, reviews)
  
  if (!walletAddress) {
    return {
      greeting: `${greeting}! 👋`,
      message: 'Welcome to the AI Agent Marketplace. Connect your wallet to unlock autonomous commerce and intelligent service discovery.',
      mood: 'welcoming',
      suggestedActions: [
        {
          id: 'connect-wallet',
          title: 'Connect Your Wallet',
          description: 'Link your Ethereum wallet to start trading',
          icon: 'wallet',
          action: 'connect',
          priority: 1,
        },
        {
          id: 'explore-services',
          title: 'Browse Services',
          description: 'Discover AI-powered services and tools',
          icon: 'search',
          action: 'explore',
          priority: 2,
        },
        {
          id: 'learn-more',
          title: 'How It Works',
          description: 'Learn about autonomous agent commerce',
          icon: 'info',
          action: 'learn',
          priority: 3,
        },
      ],
      tips: [
        'MNEE stablecoin powers all marketplace transactions',
        'Create AI agents to automate your service purchases',
        'All transactions are verified on Ethereum mainnet',
      ],
      highlights: [],
    }
  }
  
  const persona = getWalletBasedPersonality(walletAddress)
  const isReturning = profile && profile.totalVisits > 1
  
  if (newAchievements.length > 0) {
    const achievementMessages = {
      'first-connection': 'Welcome aboard! 🎉',
      'first-agent-created': 'Your first agent is ready! 🤖',
      'first-purchase': 'First transaction complete! 🎊',
      'power-user': 'You\'ve become a power user! ⚡',
      'whale': 'Welcome to the whale club! 🐋',
      'explorer': 'True explorer status achieved! 🗺️',
      'reviewer': 'Review master badge earned! ⭐',
      'early-adopter': 'Early adopter badge unlocked! 🚀',
      'loyal-customer': 'Loyal customer milestone! 💎',
    }
    
    const achievement = newAchievements[0]
    return {
      greeting: `${greeting}, ${persona}! 🎉`,
      message: achievementMessages[achievement] || 'New achievement unlocked!',
      mood: 'celebratory',
      suggestedActions: getPersonalizedActions(personalityType, agents, transactions),
      tips: getPersonalizedTips(personalityType),
      highlights: [
        {
          title: 'New Achievement',
          description: getAchievementDescription(achievement),
          type: 'achievement',
        },
        ...generateStatHighlights(agents, transactions),
      ],
    }
  }
  
  if (isReturning) {
    const daysSinceLastVisit = (Date.now() - (profile?.lastVisit || Date.now())) / (1000 * 60 * 60 * 24)
    const welcomeBackMessage = daysSinceLastVisit > 7 
      ? `Welcome back, ${persona}! We missed you. Here's what's new since your last visit.`
      : `${greeting}, ${persona}! Ready to continue your journey?`
    
    return {
      greeting: `${greeting}, ${persona}! 👋`,
      message: welcomeBackMessage,
      mood: daysSinceLastVisit > 7 ? 'welcoming' : 'informative',
      suggestedActions: getPersonalizedActions(personalityType, agents, transactions),
      tips: getPersonalizedTips(personalityType),
      highlights: generateStatHighlights(agents, transactions),
    }
  }
  
  return {
    greeting: `${greeting}, ${persona}! 🚀`,
    message: `Welcome to your personalized marketplace experience. You're identified as a ${personalityType}. Let's get you started!`,
    mood: 'motivational',
    suggestedActions: getPersonalizedActions(personalityType, agents, transactions),
    tips: getPersonalizedTips(personalityType),
    highlights: [
      {
        title: 'Your Profile Type',
        description: `You're a ${personalityType}. We've customized your experience accordingly.`,
        type: 'recommendation',
      },
    ],
  }
}

function getPersonalizedActions(
  personalityType: PersonalityType,
  agents: Agent[],
  transactions: Transaction[]
): SuggestedAction[] {
  const baseActions: Record<PersonalityType, SuggestedAction[]> = {
    newcomer: [
      {
        id: 'create-agent',
        title: 'Create Your First Agent',
        description: 'Set up an AI agent to automate purchases',
        icon: 'robot',
        action: 'create-agent',
        priority: 1,
      },
      {
        id: 'explore-services',
        title: 'Browse Popular Services',
        description: 'Discover trending AI services',
        icon: 'fire',
        action: 'view-trending',
        priority: 2,
      },
      {
        id: 'get-test-mnee',
        title: 'Get Test MNEE',
        description: 'Claim test tokens to try the platform',
        icon: 'coin',
        action: 'faucet',
        priority: 3,
      },
    ],
    explorer: [
      {
        id: 'discover-bundles',
        title: 'Check Out Service Bundles',
        description: 'Save money with curated bundles',
        icon: 'package',
        action: 'view-bundles',
        priority: 1,
      },
      {
        id: 'compare-services',
        title: 'Compare Services',
        description: 'Find the best value for your needs',
        icon: 'scales',
        action: 'compare',
        priority: 2,
      },
      {
        id: 'view-analytics',
        title: 'Explore Analytics',
        description: 'Dive into marketplace insights',
        icon: 'chart',
        action: 'analytics',
        priority: 3,
      },
    ],
    builder: [
      {
        id: 'workflow-builder',
        title: 'Build Custom Workflows',
        description: 'Chain services into automation flows',
        icon: 'flow',
        action: 'workflows',
        priority: 1,
      },
      {
        id: 'optimize-agents',
        title: 'Optimize Your Agents',
        description: 'Improve agent performance and efficiency',
        icon: 'gear',
        action: 'agent-settings',
        priority: 2,
      },
      {
        id: 'list-service',
        title: 'List Your Own Service',
        description: 'Become a provider and earn MNEE',
        icon: 'store',
        action: 'list-service',
        priority: 3,
      },
    ],
    trader: [
      {
        id: 'view-predictions',
        title: 'View AI Predictions',
        description: 'Get spending forecasts and insights',
        icon: 'crystal',
        action: 'predictions',
        priority: 1,
      },
      {
        id: 'pricing-intel',
        title: 'Check Pricing Intelligence',
        description: 'Find optimal purchase timing',
        icon: 'lightning',
        action: 'pricing',
        priority: 2,
      },
      {
        id: 'portfolio-review',
        title: 'Review Your Portfolio',
        description: 'Analyze your service investments',
        icon: 'briefcase',
        action: 'portfolio',
        priority: 3,
      },
    ],
    analyst: [
      {
        id: 'performance-analytics',
        title: 'Deep Dive Analytics',
        description: 'Comprehensive marketplace metrics',
        icon: 'chart-bar',
        action: 'analytics',
        priority: 1,
      },
      {
        id: 'network-viz',
        title: 'Network Visualization',
        description: 'Explore transaction networks',
        icon: 'network',
        action: 'network',
        priority: 2,
      },
      {
        id: 'write-reviews',
        title: 'Share Your Insights',
        description: 'Help others with detailed reviews',
        icon: 'star',
        action: 'reviews',
        priority: 3,
      },
    ],
    'power-user': [
      {
        id: 'advanced-features',
        title: 'Explore Advanced Features',
        description: 'Unlock all platform capabilities',
        icon: 'sparkle',
        action: 'advanced',
        priority: 1,
      },
      {
        id: 'provider-dashboard',
        title: 'Provider Analytics',
        description: 'Track provider performance',
        icon: 'crown',
        action: 'providers',
        priority: 2,
      },
      {
        id: 'ai-chat',
        title: 'AI Marketplace Assistant',
        description: 'Get intelligent recommendations',
        icon: 'chat',
        action: 'chat',
        priority: 3,
      },
    ],
  }
  
  return baseActions[personalityType] || baseActions.newcomer
}

function getPersonalizedTips(personalityType: PersonalityType): string[] {
  const tips: Record<PersonalityType, string[]> = {
    newcomer: [
      'Start with small test transactions to get familiar',
      'Create an agent with a low spending limit initially',
      'Explore the bundles section for better deals',
    ],
    explorer: [
      'Check the live feed to see real-time marketplace activity',
      'Use the AI search to find specific service types',
      'Compare multiple services before purchasing',
    ],
    builder: [
      'Workflow builder can chain multiple services together',
      'Set up automated triggers for your agents',
      'Consider becoming a service provider',
    ],
    trader: [
      'Review predictive analytics before large purchases',
      'Monitor pricing intelligence for optimal timing',
      'Diversify your service portfolio',
    ],
    analyst: [
      'Network visualization shows provider relationships',
      'Performance analytics reveal spending patterns',
      'Your reviews help the entire community',
    ],
    'power-user': [
      'All tabs have unique insights - explore them all',
      'AI chat can provide personalized recommendations',
      'Provider dashboard shows ecosystem health',
    ],
  }
  
  return tips[personalityType] || tips.newcomer
}

function getAchievementDescription(achievement: Achievement): string {
  const descriptions: Record<Achievement, string> = {
    'first-connection': 'You\'ve connected your wallet for the first time',
    'first-agent-created': 'Successfully created your first AI agent',
    'first-purchase': 'Completed your first marketplace transaction',
    'early-adopter': 'Joined and transacted within your first week',
    'power-user': 'Completed over 50 transactions',
    'collector': 'Collected services from multiple categories',
    'reviewer': 'Shared over 10 helpful reviews',
    'whale': 'Spent over 1,000 MNEE in the marketplace',
    'explorer': 'Tried over 15 different services',
    'loyal-customer': 'Visited the marketplace over 20 times',
    'service-provider': 'Listed your first service',
  }
  
  return descriptions[achievement] || 'Achievement unlocked'
}

function generateStatHighlights(
  agents: Agent[],
  transactions: Transaction[]
): Highlight[] {
  const highlights: Highlight[] = []
  
  if (agents.length > 0) {
    highlights.push({
      title: `${agents.length} Active Agent${agents.length !== 1 ? 's' : ''}`,
      description: 'Your AI agents are ready to work',
      type: 'statistic',
    })
  }
  
  if (transactions.length > 0) {
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
    highlights.push({
      title: `${transactions.length} Transaction${transactions.length !== 1 ? 's' : ''}`,
      description: `Total value: ${totalSpent.toFixed(2)} MNEE`,
      type: 'statistic',
    })
    
    const recentTransactions = transactions.filter(
      t => Date.now() - t.timestamp < 7 * 24 * 60 * 60 * 1000
    )
    if (recentTransactions.length > 0) {
      highlights.push({
        title: 'Active This Week',
        description: `${recentTransactions.length} transaction${recentTransactions.length !== 1 ? 's' : ''} in the last 7 days`,
        type: 'statistic',
      })
    }
  }
  
  return highlights
}
