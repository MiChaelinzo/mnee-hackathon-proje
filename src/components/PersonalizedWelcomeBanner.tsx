import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  X,
  Robot,
  Storefront,
  Fire,
  Coins,
  Package,
  Scales,
  ChartLine,
  FlowArrow,
  Gear,
  Lightning,
  Briefcase,
  ChartBar,
  GraphicsCard,
  Star,
  Sparkle,
  Crown,
  ChatCircle,
  Info,
  MagnifyingGlass,
  Trophy,
  Target,
} from '@phosphor-icons/react'
import type { Agent, Transaction, Service, ServiceReview } from '@/lib/types'
import type { UserProfile } from '@/lib/personalization'
import { generatePersonalizedWelcome } from '@/lib/personalization'

interface PersonalizedWelcomeBannerProps {
  walletAddress: string | null
  agents: Agent[]
  transactions: Transaction[]
  services: Service[]
  reviews: ServiceReview[]
  onAction: (action: string) => void
}

const iconMap: Record<string, any> = {
  wallet: Coins,
  search: MagnifyingGlass,
  info: Info,
  robot: Robot,
  fire: Fire,
  coin: Coins,
  package: Package,
  scales: Scales,
  chart: ChartLine,
  flow: FlowArrow,
  gear: Gear,
  store: Storefront,
  crystal: Sparkle,
  lightning: Lightning,
  briefcase: Briefcase,
  'chart-bar': ChartBar,
  network: GraphicsCard,
  star: Star,
  sparkle: Sparkle,
  crown: Crown,
  chat: ChatCircle,
}

export default function PersonalizedWelcomeBanner({
  walletAddress,
  agents,
  transactions,
  services,
  reviews,
  onAction,
}: PersonalizedWelcomeBannerProps) {
  const [profile, setProfile] = useKV<UserProfile | null>('user-profile', null)
  const [isDismissed, setIsDismissed] = useState(false)
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    if (walletAddress) {
      setProfile((currentProfile) => {
        if (!currentProfile || currentProfile.walletAddress !== walletAddress) {
          return {
            walletAddress,
            firstVisit: Date.now(),
            lastVisit: Date.now(),
            totalVisits: 1,
            preferences: {
              favoriteCategories: [],
              priceRange: { min: 0, max: 1000 },
              spendingPattern: 'moderate',
            },
            achievements: [],
            onboardingComplete: false,
            personalityType: 'newcomer',
          }
        }

        const newAchievements = [...currentProfile.achievements]
        if (agents.length > 0 && !newAchievements.includes('first-agent-created')) {
          newAchievements.push('first-agent-created')
        }
        if (transactions.length > 0 && !newAchievements.includes('first-purchase')) {
          newAchievements.push('first-purchase')
        }

        return {
          ...currentProfile,
          lastVisit: Date.now(),
          totalVisits: currentProfile.totalVisits + 1,
          achievements: newAchievements,
        }
      })
    }
  }, [walletAddress])

  const welcomeData = generatePersonalizedWelcome(
    walletAddress,
    profile || null,
    agents,
    transactions,
    services,
    reviews
  )

  const moodColors = {
    welcoming: 'from-blue-500/20 to-purple-500/20',
    celebratory: 'from-yellow-500/20 to-orange-500/20',
    motivational: 'from-green-500/20 to-emerald-500/20',
    informative: 'from-cyan-500/20 to-blue-500/20',
  }

  const moodEmojis = {
    welcoming: '👋',
    celebratory: '🎉',
    motivational: '🚀',
    informative: '💡',
  }

  if (isDismissed || !showBanner) {
    return null
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setTimeout(() => setShowBanner(false), 300)
  }

  const handleActionClick = (action: string) => {
    onAction(action)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-6"
      >
        <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
            aria-label="Dismiss welcome message"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-4xl"
                >
                  {moodEmojis[welcomeData.mood]}
                </motion.div>
                <div className="flex-1">
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl md:text-3xl font-bold tracking-tight mb-2"
                  >
                    {welcomeData.greeting}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground text-base md:text-lg"
                  >
                    {welcomeData.message}
                  </motion.p>
                </div>
              </div>

              {welcomeData.highlights.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-3"
                >
                  {welcomeData.highlights.map((highlight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <Badge
                        variant={highlight.type === 'achievement' ? 'default' : 'secondary'}
                        className="px-3 py-1.5 text-sm gap-2"
                      >
                        {highlight.type === 'achievement' && <Trophy className="w-4 h-4" />}
                        {highlight.type === 'statistic' && <Target className="w-4 h-4" />}
                        <span className="font-semibold">{highlight.title}:</span>
                        <span className="font-normal">{highlight.description}</span>
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {welcomeData.suggestedActions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-3"
                >
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Suggested Actions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {welcomeData.suggestedActions.map((action, index) => {
                      const IconComponent = iconMap[action.icon] || Sparkle
                      return (
                        <motion.div
                          key={action.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                        >
                          <Button
                            onClick={() => handleActionClick(action.action)}
                            variant="outline"
                            className="w-full h-auto p-4 flex flex-col items-start gap-2 hover:bg-secondary/80 hover:border-primary/50 transition-all group"
                          >
                            <div className="flex items-center gap-2 w-full">
                              <IconComponent className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                              <span className="font-semibold text-sm">{action.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground text-left">
                              {action.description}
                            </p>
                          </Button>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {welcomeData.tips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="border-t border-border pt-4"
                >
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    💡 Pro Tips
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {welcomeData.tips.map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 + index * 0.1 }}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Sparkle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{tip}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${moodColors[welcomeData.mood]} opacity-50`} />
          <div className="absolute inset-0 -z-10 grid-pattern opacity-20" />
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
