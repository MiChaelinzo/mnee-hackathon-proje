import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Medal, Crown, Sparkle, TrendUp, Fire, Star, Coins, ShoppingCart, Robot, ListChecks, Users } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Agent, Transaction, ServiceReview } from '@/lib/types'
import type { Achievement } from '@/lib/personalization'

interface LeaderboardEntry {
  walletAddress: string
  userName: string
  rank: number
  totalScore: number
  achievements: Achievement[]
  totalSpent: number
  totalPurchases: number
  totalReviews: number
  agentCount: number
  joinedDate: number
  badges: string[]
  trend: 'up' | 'down' | 'same'
  lastActive: number
}

interface AchievementLeaderboardProps {
  agents: Agent[]
  transactions: Transaction[]
  reviews: ServiceReview[]
  currentUserAddress?: string | null
}

const achievementPoints: Record<Achievement, number> = {
  'first-connection': 10,
  'first-agent-created': 20,
  'first-purchase': 25,
  'early-adopter': 50,
  'power-user': 100,
  'collector': 75,
  'reviewer': 60,
  'whale': 150,
  'explorer': 80,
  'loyal-customer': 90,
  'service-provider': 40,
}

const achievementLabels: Record<Achievement, string> = {
  'first-connection': 'First Steps',
  'first-agent-created': 'Agent Creator',
  'first-purchase': 'First Purchase',
  'early-adopter': 'Early Adopter',
  'power-user': 'Power User',
  'collector': 'Collector',
  'reviewer': 'Critic',
  'whale': 'Whale',
  'explorer': 'Explorer',
  'loyal-customer': 'Loyal',
  'service-provider': 'Provider',
}

const achievementEmoji: Record<Achievement, string> = {
  'first-connection': '👋',
  'first-agent-created': '🤖',
  'first-purchase': '🎊',
  'early-adopter': '🚀',
  'power-user': '⚡',
  'collector': '🎨',
  'reviewer': '⭐',
  'whale': '🐋',
  'explorer': '🗺️',
  'loyal-customer': '💎',
  'service-provider': '🏪',
}

export default function AchievementLeaderboard({
  agents,
  transactions,
  reviews,
  currentUserAddress,
}: AchievementLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [timeFilter, setTimeFilter] = useState<'all-time' | 'monthly' | 'weekly'>('all-time')
  const [categoryFilter, setCategoryFilter] = useState<'overall' | 'spenders' | 'reviewers' | 'agents'>('overall')
  const [animateItems, setAnimateItems] = useState(false)

  useEffect(() => {
    const entries = generateLeaderboard()
    setLeaderboard(entries)
    setAnimateItems(true)
    setTimeout(() => setAnimateItems(false), 1000)
  }, [agents, transactions, reviews, timeFilter, categoryFilter])

  const generateLeaderboard = (): LeaderboardEntry[] => {
    const userMap = new Map<string, Partial<LeaderboardEntry>>()

    const filteredTransactions = filterByTime(transactions)
    const filteredReviews = filterByTime(reviews)

    agents.forEach(agent => {
      const agentTransactions = filteredTransactions.filter(t => t.agentId === agent.id)
      const agentReviews = filteredReviews.filter(r => r.agentId === agent.id)
      
      const totalSpent = agentTransactions.reduce((sum, t) => sum + t.amount, 0)
      const uniqueServices = new Set(agentTransactions.map(t => t.serviceId)).size

      if (!userMap.has(agent.address)) {
        userMap.set(agent.address, {
          walletAddress: agent.address,
          userName: getWalletDisplayName(agent.address),
          totalSpent: 0,
          totalPurchases: 0,
          totalReviews: 0,
          agentCount: 0,
          achievements: [],
          badges: [],
          joinedDate: Date.now(),
          lastActive: Date.now(),
        })
      }

      const entry = userMap.get(agent.address)!
      entry.totalSpent = (entry.totalSpent || 0) + totalSpent
      entry.totalPurchases = (entry.totalPurchases || 0) + agentTransactions.length
      entry.totalReviews = (entry.totalReviews || 0) + agentReviews.length
      entry.agentCount = (entry.agentCount || 0) + 1

      const achievements = detectUserAchievements(
        entry,
        agentTransactions,
        agentReviews,
        uniqueServices
      )
      entry.achievements = achievements
      entry.badges = generateBadges(entry)

      if (agentTransactions.length > 0) {
        const latestTx = Math.max(...agentTransactions.map(t => t.timestamp))
        entry.lastActive = Math.max(entry.lastActive || 0, latestTx)
      }
    })

    const entries = Array.from(userMap.values()).map(entry => {
      const totalScore = calculateScore(entry as LeaderboardEntry)
      return {
        ...entry,
        totalScore,
        trend: 'same' as const,
        rank: 0,
      } as LeaderboardEntry
    })

    const sorted = entries.sort((a, b) => {
      if (categoryFilter === 'spenders') {
        return b.totalSpent - a.totalSpent
      } else if (categoryFilter === 'reviewers') {
        return b.totalReviews - a.totalReviews
      } else if (categoryFilter === 'agents') {
        return b.agentCount - a.agentCount
      }
      return b.totalScore - a.totalScore
    })

    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))
  }

  const filterByTime = <T extends { timestamp: number }>(items: T[]): T[] => {
    if (timeFilter === 'all-time') return items

    const now = Date.now()
    const cutoff = timeFilter === 'monthly' 
      ? now - 30 * 24 * 60 * 60 * 1000
      : now - 7 * 24 * 60 * 60 * 1000

    return items.filter(item => item.timestamp >= cutoff)
  }

  const detectUserAchievements = (
    entry: Partial<LeaderboardEntry>,
    transactions: Transaction[],
    reviews: ServiceReview[],
    uniqueServices: number
  ): Achievement[] => {
    const achievements: Achievement[] = []

    if (entry.agentCount! > 0) achievements.push('first-agent-created')
    if (transactions.length > 0) achievements.push('first-purchase')
    if (transactions.length > 50) achievements.push('power-user')
    if (entry.totalSpent! > 1000) achievements.push('whale')
    if (reviews.length > 10) achievements.push('reviewer')
    if (uniqueServices > 15) achievements.push('explorer')
    if (entry.totalPurchases! > 20) achievements.push('loyal-customer')

    return achievements
  }

  const generateBadges = (entry: Partial<LeaderboardEntry>): string[] => {
    const badges: string[] = []

    if (entry.totalSpent! > 1000) badges.push('High Roller')
    if (entry.totalReviews! > 20) badges.push('Review Master')
    if (entry.agentCount! >= 5) badges.push('Agent Army')
    if (entry.totalPurchases! > 100) badges.push('Super Buyer')

    return badges
  }

  const calculateScore = (entry: LeaderboardEntry): number => {
    let score = 0

    entry.achievements.forEach(achievement => {
      score += achievementPoints[achievement] || 0
    })

    score += entry.totalPurchases * 5
    score += entry.totalReviews * 10
    score += entry.agentCount * 15
    score += Math.floor(entry.totalSpent / 10)

    return score
  }

  const getWalletDisplayName = (address: string): string => {
    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const adjectives = ['Swift', 'Clever', 'Bold', 'Wise', 'Noble', 'Brave', 'Mighty', 'Cosmic', 'Quantum', 'Neural']
    const nouns = ['Trader', 'Explorer', 'Builder', 'Analyst', 'Pioneer', 'Visionary', 'Strategist', 'Champion', 'Innovator', 'Agent']
    
    return `${adjectives[hash % adjectives.length]} ${nouns[(hash * 7) % nouns.length]}`
  }

  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-slate-300'
    if (rank === 3) return 'text-amber-600'
    return 'text-muted-foreground'
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" weight="fill" />
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-300" weight="fill" />
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" weight="fill" />
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
  }

  const currentUserRank = leaderboard.find(entry => 
    entry.walletAddress === currentUserAddress
  )

  const topCategories = [
    {
      id: 'overall',
      label: 'Overall',
      icon: Trophy,
      description: 'Total achievement score',
    },
    {
      id: 'spenders',
      label: 'Top Spenders',
      icon: Coins,
      description: 'Highest total spent',
    },
    {
      id: 'reviewers',
      label: 'Top Reviewers',
      icon: Star,
      description: 'Most reviews written',
    },
    {
      id: 'agents',
      label: 'Agent Masters',
      icon: Robot,
      description: 'Most agents created',
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Trophy className="w-10 h-10 text-primary" weight="fill" />
          <h2 className="text-4xl font-bold">Achievement Leaderboard</h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Top marketplace users ranked by achievements, activity, and contributions
        </p>
      </motion.div>

      {currentUserRank && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-primary">
                    #{currentUserRank.rank}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Your Rank</div>
                    <div className="text-sm text-muted-foreground">
                      {currentUserRank.totalScore.toLocaleString()} points
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  {currentUserRank.achievements.slice(0, 4).map((achievement) => (
                    <Badge key={achievement} variant="secondary" className="gap-1">
                      <span>{achievementEmoji[achievement]}</span>
                      <span className="hidden sm:inline">{achievementLabels[achievement]}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkle className="w-5 h-5 text-primary" />
                Top Performers
              </CardTitle>
              <CardDescription>Leaders across the marketplace</CardDescription>
            </div>
            <div className="flex gap-2">
              <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as any)}>
                <TabsList>
                  <TabsTrigger value="all-time">All Time</TabsTrigger>
                  <TabsTrigger value="monthly">Month</TabsTrigger>
                  <TabsTrigger value="weekly">Week</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
            <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full mb-6">
              {topCategories.map(cat => {
                const Icon = cat.icon
                return (
                  <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{cat.label}</span>
                    <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${categoryFilter}-${timeFilter}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {leaderboard.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No leaderboard data available yet</p>
                    <p className="text-sm mt-2">Start making purchases and creating agents to appear here!</p>
                  </div>
                ) : (
                  leaderboard.slice(0, 50).map((entry, index) => (
                    <motion.div
                      key={entry.walletAddress}
                      initial={animateItems ? { opacity: 0, x: -20 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 1) }}
                      className={`
                        p-4 rounded-lg border transition-all hover:border-primary/50 hover:bg-accent/5
                        ${entry.walletAddress === currentUserAddress ? 'bg-primary/5 border-primary/30' : 'bg-card'}
                        ${entry.rank <= 3 ? 'ring-1 ring-primary/20' : ''}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 shrink-0">
                          {getRankIcon(entry.rank)}
                        </div>

                        <Avatar className="w-12 h-12 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {entry.userName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{entry.userName}</h3>
                            {entry.walletAddress === currentUserAddress && (
                              <Badge variant="default" className="text-xs">You</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)}
                          </div>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {entry.badges.map(badge => (
                              <Badge key={badge} variant="outline" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="hidden md:flex items-center gap-6 shrink-0">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Score</div>
                            <div className="font-bold text-lg">
                              {entry.totalScore.toLocaleString()}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <ShoppingCart className="w-3 h-3" />
                              Purchases
                            </div>
                            <div className="font-semibold">{entry.totalPurchases}</div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Coins className="w-3 h-3" />
                              Spent
                            </div>
                            <div className="font-semibold">{entry.totalSpent.toFixed(0)} MNEE</div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Robot className="w-3 h-3" />
                              Agents
                            </div>
                            <div className="font-semibold">{entry.agentCount}</div>
                          </div>
                        </div>

                        <div className="hidden lg:flex gap-1 shrink-0">
                          {entry.achievements.slice(0, 5).map((achievement) => (
                            <div
                              key={achievement}
                              title={achievementLabels[achievement]}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-accent/50 text-lg hover:scale-110 transition-transform cursor-help"
                            >
                              {achievementEmoji[achievement]}
                            </div>
                          ))}
                          {entry.achievements.length > 5 && (
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-accent/50 text-xs font-bold">
                              +{entry.achievements.length - 5}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:hidden mt-3 pt-3 border-t flex justify-between text-sm">
                        <div>
                          <span className="text-muted-foreground">Score: </span>
                          <span className="font-bold">{entry.totalScore.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Purchases: </span>
                          <span className="font-semibold">{entry.totalPurchases}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Agents: </span>
                          <span className="font-semibold">{entry.agentCount}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Fire className="w-6 h-6 text-primary" weight="fill" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Most Active</div>
                <div className="font-bold">
                  {leaderboard[0]?.userName || 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-accent/20">
                <Coins className="w-6 h-6 text-accent" weight="fill" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Highest Spender</div>
                <div className="font-bold">
                  {leaderboard.sort((a, b) => b.totalSpent - a.totalSpent)[0]?.totalSpent.toFixed(0) || '0'} MNEE
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-secondary/20">
                <Star className="w-6 h-6 text-yellow-500" weight="fill" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Top Reviewer</div>
                <div className="font-bold">
                  {leaderboard.sort((a, b) => b.totalReviews - a.totalReviews)[0]?.totalReviews || 0} reviews
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-muted">
                <Users className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Users</div>
                <div className="font-bold">{leaderboard.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5" />
            Achievement Guide
          </CardTitle>
          <CardDescription>How to earn points and climb the leaderboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(achievementPoints) as Achievement[]).map((achievement) => (
              <div
                key={achievement}
                className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{achievementEmoji[achievement]}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{achievementLabels[achievement]}</div>
                    <Badge variant="secondary" className="text-xs">
                      +{achievementPoints[achievement]} pts
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getAchievementGuide(achievement)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getAchievementGuide(achievement: Achievement): string {
  const guides: Record<Achievement, string> = {
    'first-connection': 'Connect your wallet to the marketplace',
    'first-agent-created': 'Create your first AI agent',
    'first-purchase': 'Complete your first service purchase',
    'early-adopter': 'Join and make purchases within your first week',
    'power-user': 'Complete over 50 transactions',
    'collector': 'Purchase services from multiple categories',
    'reviewer': 'Write over 10 helpful reviews',
    'whale': 'Spend over 1,000 MNEE total',
    'explorer': 'Try over 15 different services',
    'loyal-customer': 'Visit the marketplace over 20 times',
    'service-provider': 'List your own service in the marketplace',
  }
  return guides[achievement] || 'Complete this achievement to earn points'
}
