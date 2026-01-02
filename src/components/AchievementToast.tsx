import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X, Sparkle } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Achievement } from '@/lib/personalization'

interface AchievementToastProps {
  achievement: Achievement | null
  onDismiss: () => void
}

const achievementData: Record<Achievement, { title: string; description: string; emoji: string }> = {
  'first-connection': {
    title: 'First Connection',
    description: 'Successfully connected your wallet',
    emoji: '🎉',
  },
  'first-agent-created': {
    title: 'Agent Builder',
    description: 'Created your first AI agent',
    emoji: '🤖',
  },
  'first-purchase': {
    title: 'First Transaction',
    description: 'Completed your first purchase',
    emoji: '🎊',
  },
  'early-adopter': {
    title: 'Early Adopter',
    description: 'Joined and transacted within a week',
    emoji: '🚀',
  },
  'power-user': {
    title: 'Power User',
    description: 'Completed over 50 transactions',
    emoji: '⚡',
  },
  'collector': {
    title: 'Service Collector',
    description: 'Purchased from multiple categories',
    emoji: '🎯',
  },
  'reviewer': {
    title: 'Review Master',
    description: 'Shared over 10 helpful reviews',
    emoji: '⭐',
  },
  'whale': {
    title: 'Whale Status',
    description: 'Spent over 1,000 MNEE',
    emoji: '🐋',
  },
  'explorer': {
    title: 'True Explorer',
    description: 'Tried over 15 different services',
    emoji: '🗺️',
  },
  'loyal-customer': {
    title: 'Loyal Customer',
    description: 'Visited over 20 times',
    emoji: '💎',
  },
  'service-provider': {
    title: 'Service Provider',
    description: 'Listed your first service',
    emoji: '🏪',
  },
}

export default function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        handleDismiss()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [achievement])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      onDismiss()
    }, 300)
  }

  if (!achievement) return null

  const data = achievementData[achievement]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -100, x: '-50%' }}
          className="fixed top-20 left-1/2 z-[100] w-full max-w-md px-4"
        >
          <Card className="relative overflow-hidden border-2 border-accent bg-card shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 animate-shimmer" />
            
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 z-10 p-1 rounded-lg hover:bg-secondary/50 transition-colors"
              aria-label="Dismiss achievement"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative p-6">
              <div className="flex items-start gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="flex-shrink-0"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-3xl glow-accent">
                    {data.emoji}
                  </div>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-5 h-5 text-accent" weight="fill" />
                    <Badge variant="secondary" className="text-xs">
                      Achievement Unlocked
                    </Badge>
                  </div>
                  
                  <motion.h3
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg font-bold mb-1"
                  >
                    {data.title}
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-muted-foreground"
                  >
                    {data.description}
                  </motion.p>
                </div>
              </div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 5, ease: 'linear' }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-accent origin-left"
              />
            </div>

            <div className="absolute top-0 left-0 right-0 flex justify-center gap-2 pt-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: [-20, 0, 10], opacity: [0, 1, 0] }}
                  transition={{
                    delay: i * 0.1,
                    duration: 1.5,
                    repeat: 2,
                    ease: 'easeOut',
                  }}
                >
                  <Sparkle className="w-3 h-3 text-accent" weight="fill" />
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
