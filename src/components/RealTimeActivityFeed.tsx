import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { 
  Lightning, 
  ShoppingCart, 
  Star, 
  ChatCircle, 
  TrendUp,
  Package,
  Crown,
  Robot,
  CurrencyDollar,
  Pause,
  Play
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Transaction, ServiceReview } from '@/lib/types'

interface ActivityEvent {
  id: string
  type: 'purchase' | 'review' | 'bundle' | 'subscription' | 'chat' | 'listing'
  title: string
  description: string
  timestamp: number
  amount?: number
  rating?: number
  icon: React.ReactNode
  color: string
}

interface RealTimeActivityFeedProps {
  transactions: Transaction[]
  reviews: ServiceReview[]
  showLive?: boolean
}

export default function RealTimeActivityFeed({ 
  transactions, 
  reviews,
  showLive = true
}: RealTimeActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [liveEvents, setLiveEvents] = useKV<ActivityEvent[]>('live-activity-events', [])

  useEffect(() => {
    const events: ActivityEvent[] = []

    transactions.slice(0, 20).forEach(tx => {
      events.push({
        id: tx.id,
        type: tx.type === 'bundle' ? 'bundle' : tx.type === 'subscription' ? 'subscription' : 'purchase',
        title: tx.type === 'bundle' ? 'Bundle Purchased' : tx.type === 'subscription' ? 'Subscription Activated' : 'Service Purchased',
        description: `${tx.agentName} bought ${tx.serviceName}`,
        timestamp: tx.timestamp,
        amount: tx.amount,
        icon: tx.type === 'bundle' ? <Package className="w-5 h-5" /> : tx.type === 'subscription' ? <TrendUp className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />,
        color: tx.type === 'bundle' ? 'text-purple-500' : tx.type === 'subscription' ? 'text-blue-500' : 'text-green-500'
      })
    })

    reviews.slice(0, 20).forEach(review => {
      events.push({
        id: review.id,
        type: 'review',
        title: 'New Review',
        description: `${review.agentName} rated a service ${review.rating}★`,
        timestamp: review.timestamp,
        rating: review.rating,
        icon: <Star className="w-5 h-5" />,
        color: 'text-yellow-500'
      })
    })

    events.sort((a, b) => b.timestamp - a.timestamp)
    setActivities(events.slice(0, 50))
  }, [transactions, reviews])

  useEffect(() => {
    if (!showLive || isPaused) return

    const interval = setInterval(() => {
      const eventTypes = [
        { type: 'purchase', title: 'Service Purchased', icon: <ShoppingCart className="w-5 h-5" />, color: 'text-green-500' },
        { type: 'review', title: 'New Review', icon: <Star className="w-5 h-5" />, color: 'text-yellow-500' },
        { type: 'chat', title: 'Chat Started', icon: <ChatCircle className="w-5 h-5" />, color: 'text-blue-500' },
        { type: 'listing', title: 'Service Listed', icon: <Crown className="w-5 h-5" />, color: 'text-accent' },
      ]

      const agents = [
        'TradingBot Alpha', 'DataMiner Pro', 'ContentGen AI', 'Vision Analyzer',
        'CodeReview Agent', 'Market Scout', 'Crypto Watcher', 'Analytics Pro',
        'Media Bot', 'Research Assistant', 'Task Automator', 'Smart Predictor'
      ]

      const services = [
        'GPU Compute Access', 'Real-Time Data Feed', 'Sentiment Analysis',
        'Image Processing', 'Code Review API', 'Market Data Stream',
        'Content Generation', 'OCR Service', 'Voice Synthesis', 'ML Model Training'
      ]

      const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      const randomAgent = agents[Math.floor(Math.random() * agents.length)]
      const randomService = services[Math.floor(Math.random() * services.length)]
      const randomAmount = (Math.random() * 50 + 5).toFixed(2)
      const randomRating = Math.floor(Math.random() * 2) + 4

      const newEvent: ActivityEvent = {
        id: crypto.randomUUID(),
        type: randomEvent.type as any,
        title: randomEvent.title,
        description: randomEvent.type === 'review' 
          ? `${randomAgent} rated ${randomService} ${randomRating}★`
          : randomEvent.type === 'chat'
            ? `${randomAgent} started a conversation`
            : randomEvent.type === 'listing'
              ? `New service "${randomService}" listed`
              : `${randomAgent} purchased ${randomService}`,
        timestamp: Date.now(),
        amount: randomEvent.type === 'purchase' ? parseFloat(randomAmount) : undefined,
        rating: randomEvent.type === 'review' ? randomRating : undefined,
        icon: randomEvent.icon,
        color: randomEvent.color
      }

      setLiveEvents((current = []) => {
        const updated = [newEvent, ...current].slice(0, 100)
        return updated
      })
    }, Math.random() * 3000 + 2000)

    return () => clearInterval(interval)
  }, [showLive, isPaused])

  const allActivities = showLive 
    ? [...(liveEvents || []), ...activities]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50)
    : activities

  const getRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightning className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Live Activity Feed</CardTitle>
              <CardDescription>
                Real-time marketplace events
              </CardDescription>
            </div>
          </div>
          {showLive && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPaused(!isPaused)}
                className="gap-2"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                )}
              </Button>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-gray-500' : 'bg-green-500 animate-pulse'}`} />
                <span className="text-xs text-muted-foreground">
                  {isPaused ? 'Paused' : 'Live'}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100vh-20rem)] px-6">
          <div className="py-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {allActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm">{activity.title}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {getRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {activity.description}
                    </p>
                    {activity.amount && (
                      <Badge variant="outline" className="mt-2 gap-1">
                        <CurrencyDollar className="w-3 h-3" />
                        {activity.amount} MNEE
                      </Badge>
                    )}
                    {activity.rating && (
                      <div className="mt-2 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < activity.rating! ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {allActivities.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Lightning className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm mt-1">Transactions will appear here in real-time</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
