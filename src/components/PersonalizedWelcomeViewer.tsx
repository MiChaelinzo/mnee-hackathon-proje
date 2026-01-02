import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Trophy,
  TrendUp,
  Clock,
  Sparkle,
  Crown,
  Target,
  Brain,
  Lightning,
  Star,
  ChartBar,
  Robot,
  Wallet,
  Calendar,
  Fire,
  Heart,
  Medal,
} from '@phosphor-icons/react'
import type { Agent, Transaction, Service, ServiceReview } from '@/lib/types'
import type { UserProfile, Achievement, PersonalityType } from '@/lib/personalization'
import {
  getTimeBasedGreeting,
  getWalletBasedPersonality,
  analyzeUserBehavior,
  generatePersonalizedWelcome,
} from '@/lib/personalization'

interface PersonalizedWelcomeViewerProps {
  walletAddress: string | null
  agents: Agent[]
  transactions: Transaction[]
  services: Service[]
  reviews: ServiceReview[]
}

const achievementIcons: Record<Achievement, React.ComponentType<any>> = {
  'first-connection': Wallet,
  'first-agent-created': Robot,
  'first-purchase': Trophy,
  'early-adopter': Lightning,
  'power-user': Crown,
  'collector': Star,
  'reviewer': Medal,
  'whale': Crown,
  'explorer': Target,
  'loyal-customer': Heart,
  'service-provider': Sparkle,
}

const personalityDescriptions: Record<PersonalityType, { description: string; traits: string[]; icon: React.ComponentType<any> }> = {
  newcomer: {
    description: 'Just starting your journey in the AI marketplace',
    traits: ['Learning the ropes', 'Exploring options', 'Building confidence'],
    icon: Sparkle,
  },
  explorer: {
    description: 'Actively discovering new services and opportunities',
    traits: ['Curious mindset', 'Diverse interests', 'Open to experimentation'],
    icon: Target,
  },
  builder: {
    description: 'Creating and optimizing AI agent workflows',
    traits: ['Automation-focused', 'Efficiency-driven', 'Strategic planner'],
    icon: Robot,
  },
  trader: {
    description: 'High-volume purchaser with strategic spending',
    traits: ['Market-savvy', 'Value-conscious', 'Data-driven decisions'],
    icon: TrendUp,
  },
  analyst: {
    description: 'Deep diver who shares insights through reviews',
    traits: ['Detail-oriented', 'Community-focused', 'Quality evaluator'],
    icon: ChartBar,
  },
  'power-user': {
    description: 'Master of the marketplace with extensive experience',
    traits: ['Platform expert', 'High engagement', 'Ecosystem contributor'],
    icon: Crown,
  },
}

export default function PersonalizedWelcomeViewer({
  walletAddress,
  agents,
  transactions,
  services,
  reviews,
}: PersonalizedWelcomeViewerProps) {
  const [profile] = useKV<UserProfile | null>('user-profile', null)
  const [activeTab, setActiveTab] = useState('overview')

  if (!walletAddress) {
    return (
      <Card className="p-8 text-center">
        <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground">
          Connect your wallet to view your personalized profile and insights
        </p>
      </Card>
    )
  }

  const welcomeData = generatePersonalizedWelcome(
    walletAddress,
    profile || null,
    agents,
    transactions,
    services,
    reviews
  )

  const personalityType = analyzeUserBehavior(agents, transactions, services, reviews)
  const personalityInfo = personalityDescriptions[personalityType]
  const PersonalityIcon = personalityInfo.icon
  const persona = getWalletBasedPersonality(walletAddress)

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
  const uniqueServices = new Set(transactions.map(t => t.serviceId)).size
  const favoriteCategory = transactions.length > 0
    ? Object.entries(
        transactions.reduce((acc, t) => {
          const service = services.find(s => s.id === t.serviceId)
          if (service) {
            acc[service.category] = (acc[service.category] || 0) + 1
          }
          return acc
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
    : 'None'

  const daysSinceFirstVisit = profile
    ? Math.floor((Date.now() - profile.firstVisit) / (1000 * 60 * 60 * 24))
    : 0

  const achievementProgress = {
    'first-connection': profile ? 100 : 0,
    'first-agent-created': agents.length > 0 ? 100 : 0,
    'first-purchase': transactions.length > 0 ? 100 : 0,
    'power-user': Math.min((transactions.length / 50) * 100, 100),
    'whale': Math.min((totalSpent / 1000) * 100, 100),
    'reviewer': Math.min((reviews.length / 10) * 100, 100),
    'explorer': Math.min((uniqueServices / 15) * 100, 100),
    'early-adopter': daysSinceFirstVisit < 7 && transactions.length >= 5 ? 100 : Math.min((transactions.length / 5) * 100, 100),
    'loyal-customer': profile ? Math.min((profile.totalVisits / 20) * 100, 100) : 0,
  }

  const completedAchievements = profile?.achievements || []
  const totalAchievements = Object.keys(achievementProgress).length
  const achievementPercentage = (completedAchievements.length / totalAchievements) * 100

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="relative overflow-hidden border-2 border-primary/30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 -z-10" />
          <div className="absolute inset-0 grid-pattern opacity-10 -z-10" />
          
          <div className="p-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="p-4 rounded-2xl bg-primary/20 backdrop-blur-sm">
                <User className="w-12 h-12 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{getTimeBasedGreeting()}, {persona}!</h2>
                <p className="text-lg text-muted-foreground mb-4">{welcomeData.message}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-2">
                    <PersonalityIcon className="w-4 h-4" />
                    {personalityType}
                  </Badge>
                  <Badge variant="outline" className="gap-2">
                    <Trophy className="w-4 h-4" />
                    {completedAchievements.length} Achievements
                  </Badge>
                  {profile && (
                    <Badge variant="outline" className="gap-2">
                      <Calendar className="w-4 h-4" />
                      {daysSinceFirstVisit} Days Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Robot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Agents</p>
                    <p className="text-2xl font-bold">{agents.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <TrendUp className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-bold">{transactions.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <Star className="w-5 h-5" style={{ color: 'oklch(var(--chart-1))' }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">{totalSpent.toFixed(0)} Ⓜ</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-2/20">
                    <Target className="w-5 h-5" style={{ color: 'oklch(var(--chart-2))' }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Services Used</p>
                    <p className="text-2xl font-bold">{uniqueServices}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <Brain className="w-4 h-4" />
              Personality
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="behavior" className="gap-2">
              <ChartBar className="w-4 h-4" />
              Behavior
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-primary/20">
                  <PersonalityIcon className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 capitalize">{personalityType}</h3>
                  <p className="text-muted-foreground">{personalityInfo.description}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Key Traits
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {personalityInfo.traits.map((trait, index) => (
                    <motion.div
                      key={trait}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-4 bg-secondary/50">
                        <div className="flex items-center gap-2">
                          <Sparkle className="w-4 h-4 text-accent" />
                          <span className="font-medium">{trait}</span>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Recommended For You
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {welcomeData.suggestedActions.slice(0, 4).map((action, index) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <Lightning className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold mb-1">{action.title}</h5>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold">Achievement Progress</h3>
                  <Badge variant="outline" className="gap-2">
                    <Trophy className="w-4 h-4" />
                    {completedAchievements.length} / {totalAchievements}
                  </Badge>
                </div>
                <Progress value={achievementPercentage} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  {achievementPercentage.toFixed(0)}% Complete
                </p>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                {Object.entries(achievementProgress).map(([achievement, progress]) => {
                  const AchievementIcon = achievementIcons[achievement as Achievement] || Trophy
                  const isCompleted = completedAchievements.includes(achievement as Achievement)

                  return (
                    <motion.div
                      key={achievement}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isCompleted
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex items-start gap-4 mb-3">
                        <div className={`p-3 rounded-xl ${
                          isCompleted ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                          <AchievementIcon className={`w-6 h-6 ${
                            isCompleted ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold capitalize">
                              {achievement.replace(/-/g, ' ')}
                            </h4>
                            {isCompleted && (
                              <Badge variant="default" className="gap-1">
                                <Trophy className="w-3 h-3" />
                                Unlocked
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {getAchievementDescription(achievement as Achievement, progress)}
                          </p>
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {progress.toFixed(0)}% Complete
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">Behavior Analysis</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Spending Pattern</h4>
                    <Badge variant="outline">
                      {profile?.preferences.spendingPattern || 'moderate'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Based on your transaction history and frequency
                  </p>
                  <Card className="p-4 bg-secondary/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average per transaction</span>
                      <span className="font-bold">
                        {transactions.length > 0 ? (totalSpent / transactions.length).toFixed(2) : '0.00'} Ⓜ
                      </span>
                    </div>
                  </Card>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Favorite Category</h4>
                  <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10">
                    <div className="flex items-center gap-3">
                      <Fire className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-bold text-lg">{favoriteCategory}</p>
                        <p className="text-sm text-muted-foreground">
                          Most purchased service type
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Activity Metrics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4 bg-secondary/50">
                      <p className="text-sm text-muted-foreground mb-1">Active Agents</p>
                      <p className="text-2xl font-bold">
                        {agents.filter(a => a.isActive).length}
                      </p>
                    </Card>
                    <Card className="p-4 bg-secondary/50">
                      <p className="text-sm text-muted-foreground mb-1">Reviews Written</p>
                      <p className="text-2xl font-bold">{reviews.length}</p>
                    </Card>
                    <Card className="p-4 bg-secondary/50">
                      <p className="text-sm text-muted-foreground mb-1">Avg Agent Balance</p>
                      <p className="text-2xl font-bold">
                        {agents.length > 0
                          ? (agents.reduce((sum, a) => sum + a.balance, 0) / agents.length).toFixed(0)
                          : '0'} Ⓜ
                      </p>
                    </Card>
                    <Card className="p-4 bg-secondary/50">
                      <p className="text-sm text-muted-foreground mb-1">Total Visits</p>
                      <p className="text-2xl font-bold">{profile?.totalVisits || 0}</p>
                    </Card>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">Activity Timeline</h3>

              {profile && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Wallet className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">First Visit</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(profile.firstVisit).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {transactions.length > 0 && (
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
                      <div className="p-2 rounded-lg bg-accent/20">
                        <Trophy className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">First Transaction</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transactions[transactions.length - 1].timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {transactions.length > 0 && (
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
                      <div className="p-2 rounded-lg bg-chart-1/20">
                        <Clock className="w-5 h-5" style={{ color: 'oklch(var(--chart-1))' }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Latest Transaction</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transactions[0].timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="p-2 rounded-lg bg-chart-2/20">
                      <Calendar className="w-5 h-5" style={{ color: 'oklch(var(--chart-2))' }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Account Age</p>
                      <p className="text-sm text-muted-foreground">
                        {daysSinceFirstVisit} days
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!profile && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No history available yet</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

function getAchievementDescription(achievement: Achievement, progress: number): string {
  const descriptions: Record<Achievement, string> = {
    'first-connection': 'Connect your wallet to the marketplace',
    'first-agent-created': 'Create your first AI agent',
    'first-purchase': 'Complete your first transaction',
    'power-user': 'Complete 50 transactions in total',
    'whale': 'Spend over 1,000 MNEE in the marketplace',
    'reviewer': 'Write 10 helpful reviews',
    'explorer': 'Try 15 different services',
    'early-adopter': 'Make 5 purchases within your first week',
    'loyal-customer': 'Visit the marketplace 20 times',
    'collector': 'Collect services from multiple categories',
    'service-provider': 'List your first service on the marketplace',
  }

  return descriptions[achievement] || 'Complete the required actions'
}
