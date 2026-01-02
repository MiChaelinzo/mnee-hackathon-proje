import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import {
  User,
  Trophy,
  Sparkle,
  ChartLine,
  Calendar,
  Target,
  Crown,
  Lightning,
  CheckCircle,
} from '@phosphor-icons/react'
import type { UserProfile, Achievement } from '@/lib/personalization'
import type { Agent, Transaction } from '@/lib/types'
import { getWalletBasedPersonality, analyzeUserBehavior } from '@/lib/personalization'

interface UserProfileViewProps {
  walletAddress: string
  agents: Agent[]
  transactions: Transaction[]
}

const achievementInfo: Record<Achievement, { icon: any; color: string; description: string }> = {
  'first-connection': { icon: CheckCircle, color: 'text-blue-500', description: 'Connected your wallet' },
  'first-agent-created': { icon: Target, color: 'text-purple-500', description: 'Created first AI agent' },
  'first-purchase': { icon: Sparkle, color: 'text-green-500', description: 'First marketplace transaction' },
  'early-adopter': { icon: Lightning, color: 'text-yellow-500', description: 'Early platform adopter' },
  'power-user': { icon: Crown, color: 'text-orange-500', description: '50+ transactions completed' },
  'collector': { icon: Trophy, color: 'text-pink-500', description: 'Multi-category purchaser' },
  'reviewer': { icon: ChartLine, color: 'text-cyan-500', description: '10+ reviews shared' },
  'whale': { icon: Crown, color: 'text-amber-500', description: '1,000+ MNEE spent' },
  'explorer': { icon: Target, color: 'text-indigo-500', description: '15+ services tried' },
  'loyal-customer': { icon: CheckCircle, color: 'text-emerald-500', description: '20+ visits' },
  'service-provider': { icon: Trophy, color: 'text-violet-500', description: 'Listed a service' },
}

const personalityDescriptions = {
  newcomer: 'Just getting started with the marketplace',
  explorer: 'Actively discovering new services and features',
  builder: 'Creating and optimizing AI agent workflows',
  trader: 'Strategic purchaser with spending insights',
  analyst: 'Data-driven decision maker and reviewer',
  'power-user': 'Experienced marketplace expert',
}

export default function UserProfileView({
  walletAddress,
  agents,
  transactions,
}: UserProfileViewProps) {
  const [profile] = useKV<UserProfile | null>('user-profile', null)

  if (!profile) {
    return (
      <Card className="p-8 text-center">
        <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Profile Yet</h3>
        <p className="text-muted-foreground">
          Connect your wallet and start using the marketplace to build your profile
        </p>
      </Card>
    )
  }

  const persona = getWalletBasedPersonality(walletAddress)
  const personalityType = analyzeUserBehavior(agents, transactions, [], [])
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
  const daysSinceJoined = Math.floor((Date.now() - profile.firstVisit) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-2 border-primary/20">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl">
              {persona.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{persona}</h2>
              <p className="text-sm text-muted-foreground">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-2">
            <Sparkle className="w-4 h-4" weight="fill" />
            {personalityType.charAt(0).toUpperCase() + personalityType.slice(1)}
          </Badge>
        </div>

        <p className="text-muted-foreground mb-6">
          {personalityDescriptions[personalityType]}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-secondary/30">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{daysSinceJoined}</div>
            <div className="text-xs text-muted-foreground">Days Active</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/30">
            <ChartLine className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">{transactions.length}</div>
            <div className="text-xs text-muted-foreground">Transactions</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/30">
            <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{agents.length}</div>
            <div className="text-xs text-muted-foreground">Active Agents</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/30">
            <Crown className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">{totalSpent.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">MNEE Spent</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-accent" weight="fill" />
          <h3 className="text-xl font-bold">Achievements</h3>
          <Badge variant="secondary" className="ml-auto">
            {profile.achievements.length} Unlocked
          </Badge>
        </div>

        {profile.achievements.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No achievements yet. Start using the marketplace to unlock them!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.achievements.map((achievement, index) => {
              const info = achievementInfo[achievement]
              const IconComponent = info.icon
              return (
                <motion.div
                  key={achievement}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:bg-secondary/50 transition-colors border-2 border-border hover:border-primary/50">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <IconComponent className={`w-8 h-8 ${info.color}`} weight="fill" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1 capitalize">
                          {achievement.replace(/-/g, ' ')}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {info.description}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" weight="fill" />
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        <Separator className="my-6" />

        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-4">Available Achievements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(Object.keys(achievementInfo) as Achievement[])
              .filter((achievement) => !profile.achievements.includes(achievement))
              .map((achievement) => {
                const info = achievementInfo[achievement]
                const IconComponent = info.icon
                return (
                  <div
                    key={achievement}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 opacity-60"
                  >
                    <IconComponent className={`w-6 h-6 ${info.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium capitalize">
                        {achievement.replace(/-/g, ' ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {info.description}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Activity History</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-sm text-muted-foreground">First Visit</span>
            <span className="text-sm font-medium">
              {new Date(profile.firstVisit).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-sm text-muted-foreground">Last Visit</span>
            <span className="text-sm font-medium">
              {new Date(profile.lastVisit).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-sm text-muted-foreground">Total Visits</span>
            <span className="text-sm font-medium">{profile.totalVisits}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-sm text-muted-foreground">Spending Pattern</span>
            <Badge variant="outline" className="capitalize">
              {profile.preferences.spendingPattern}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}
