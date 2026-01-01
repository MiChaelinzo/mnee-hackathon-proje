import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  Star, 
  ShoppingCart, 
  TrendUp, 
  Medal,
  Crown,
  Fire,
  CheckCircle
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { Agent, Transaction, ServiceReview, ReputationBadge } from '@/lib/types'
import type { ReactElement } from 'react'

interface AgentReputationProps {
  agent: Agent
  transactions: Transaction[]
  reviews: ServiceReview[]
}

const BADGE_INFO: Record<ReputationBadge, { label: string; icon: ReactElement; description: string }> = {
  'early-adopter': {
    label: 'Early Adopter',
    icon: <Star className="w-4 h-4" weight="fill" />,
    description: 'One of the first agents on the platform',
  },
  'big-spender': {
    label: 'Big Spender',
    icon: <Fire className="w-4 h-4" />,
    description: 'Spent over 1000 MNEE',
  },
  'frequent-buyer': {
    label: 'Frequent Buyer',
    icon: <ShoppingCart className="w-4 h-4" />,
    description: 'Made 50+ purchases',
  },
  'helpful-reviewer': {
    label: 'Helpful Reviewer',
    icon: <Medal className="w-4 h-4" />,
    description: 'Provided 10+ helpful reviews',
  },
  'verified-agent': {
    label: 'Verified Agent',
    icon: <CheckCircle className="w-4 h-4" />,
    description: 'Identity verified',
  },
  'trusted-trader': {
    label: 'Trusted Trader',
    icon: <Crown className="w-4 h-4" />,
    description: 'High trust score and activity',
  },
}

export default function AgentReputation({
  agent,
  transactions,
  reviews,
}: AgentReputationProps) {
  const reputation = useMemo(() => {
    const agentTransactions = transactions.filter(t => t.agentId === agent.id && t.status === 'completed')
    const agentReviews = reviews.filter(r => r.agentId === agent.id)
    
    const totalPurchases = agentTransactions.length
    const totalSpent = agentTransactions.reduce((acc, t) => acc + t.amount, 0)
    const reviewsGiven = agentReviews.length
    const accountAge = Date.now() - (agentTransactions[0]?.timestamp || Date.now())
    const accountAgeDays = Math.max(1, Math.floor(accountAge / (1000 * 60 * 60 * 24)))

    let trustScore = 0
    
    trustScore += Math.min(totalPurchases * 2, 30)
    trustScore += Math.min(totalSpent / 10, 20)
    trustScore += Math.min(reviewsGiven * 3, 15)
    trustScore += Math.min(accountAgeDays / 7, 15)
    
    if (agent.isActive) trustScore += 10
    
    trustScore = Math.min(100, Math.round(trustScore))

    const badges: ReputationBadge[] = []
    
    if (accountAgeDays < 30 && totalPurchases > 0) {
      badges.push('early-adopter')
    }
    if (totalSpent >= 1000) {
      badges.push('big-spender')
    }
    if (totalPurchases >= 50) {
      badges.push('frequent-buyer')
    }
    if (reviewsGiven >= 10) {
      badges.push('helpful-reviewer')
    }
    if (agent.isActive && totalPurchases > 5) {
      badges.push('verified-agent')
    }
    if (trustScore >= 80) {
      badges.push('trusted-trader')
    }

    return {
      trustScore,
      totalPurchases,
      totalSpent,
      reviewsGiven,
      accountAgeDays,
      badges,
    }
  }, [agent, transactions, reviews])

  const getTrustLevel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-500' }
    if (score >= 60) return { label: 'Good', color: 'text-accent' }
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-500' }
    return { label: 'Building', color: 'text-muted-foreground' }
  }

  const trustLevel = getTrustLevel(reputation.trustScore)

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Agent Reputation
        </CardTitle>
        <CardDescription>
          Trust metrics and achievement badges
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendUp className="w-5 h-5 text-primary" />
              <span className="font-semibold">Trust Score</span>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-bold ${trustLevel.color}`}>
                {reputation.trustScore}
              </span>
              <span className="text-muted-foreground">/100</span>
            </div>
          </div>
          <Progress value={reputation.trustScore} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {trustLevel.label} reputation
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total Purchases</p>
            <p className="text-2xl font-bold">{reputation.totalPurchases}</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
            <p className="text-2xl font-bold">{reputation.totalSpent.toFixed(0)} MNEE</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Reviews Given</p>
            <p className="text-2xl font-bold">{reputation.reviewsGiven}</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Account Age</p>
            <p className="text-2xl font-bold">{reputation.accountAgeDays}d</p>
          </div>
        </div>

        {reputation.badges.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Medal className="w-4 h-4 text-accent" />
              Achievement Badges
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {reputation.badges.map((badgeKey, index) => {
                const badge = BADGE_INFO[badgeKey]
                return (
                  <motion.div
                    key={badgeKey}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Badge
                      variant="outline"
                      className="w-full justify-start gap-2 py-2 px-3 bg-accent/10 border-accent/20 hover:bg-accent/20 transition-colors"
                    >
                      {badge.icon}
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-xs">{badge.label}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                      </div>
                    </Badge>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {reputation.badges.length === 0 && (
          <div className="text-center py-6">
            <Medal className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Complete more transactions to earn badges
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
