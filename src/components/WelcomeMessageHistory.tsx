import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Clock,
  Sparkle,
  Fire,
  Lightbulb,
  Info,
  X,
  ChartLine,
  TrendUp,
  Star,
  Heart,
  Eye,
} from '@phosphor-icons/react'
import type { Agent, Transaction, Service, ServiceReview } from '@/lib/types'
import type { UserProfile, PersonalizedWelcome } from '@/lib/personalization'
import { generatePersonalizedWelcome } from '@/lib/personalization'

interface WelcomeMessageHistoryProps {
  walletAddress: string | null
  agents: Agent[]
  transactions: Transaction[]
  services: Service[]
  reviews: ServiceReview[]
}

interface StoredWelcomeMessage {
  id: string
  timestamp: number
  greeting: string
  message: string
  mood: PersonalizedWelcome['mood']
  personalityType: string
  stats: {
    agentCount: number
    transactionCount: number
    totalSpent: number
  }
}

const moodIcons = {
  welcoming: Sparkle,
  celebratory: Fire,
  motivational: TrendUp,
  informative: Lightbulb,
}

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

export default function WelcomeMessageHistory({
  walletAddress,
  agents,
  transactions,
  services,
  reviews,
}: WelcomeMessageHistoryProps) {
  const [profile] = useKV<UserProfile | null>('user-profile', null)
  const [messageHistory, setMessageHistory] = useKV<StoredWelcomeMessage[]>('welcome-message-history', [])
  const [selectedMessage, setSelectedMessage] = useState<StoredWelcomeMessage | null>(null)
  const [currentWelcome, setCurrentWelcome] = useState<PersonalizedWelcome | null>(null)

  useEffect(() => {
    if (walletAddress && profile) {
      const welcomeData = generatePersonalizedWelcome(
        walletAddress,
        profile,
        agents,
        transactions,
        services,
        reviews
      )
      setCurrentWelcome(welcomeData)

      const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
      
      const newMessage: StoredWelcomeMessage = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        greeting: welcomeData.greeting,
        message: welcomeData.message,
        mood: welcomeData.mood,
        personalityType: profile.personalityType,
        stats: {
          agentCount: agents.length,
          transactionCount: transactions.length,
          totalSpent,
        },
      }

      setMessageHistory((current) => {
        const recentMessages = current || []
        const lastMessage = recentMessages[0]
        
        if (!lastMessage || Date.now() - lastMessage.timestamp > 60 * 60 * 1000) {
          return [newMessage, ...recentMessages].slice(0, 50)
        }
        
        return recentMessages
      })
    }
  }, [walletAddress, profile?.totalVisits, agents.length, transactions.length])

  const handleViewMessage = (message: StoredWelcomeMessage) => {
    setSelectedMessage(message)
  }

  const handleClearHistory = () => {
    setMessageHistory([])
  }

  if (!walletAddress) {
    return (
      <Card className="p-8 text-center">
        <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground">
          Connect your wallet to view your personalized message history
        </p>
      </Card>
    )
  }

  const sortedMessages = [...(messageHistory || [])].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-1">Welcome Message History</h3>
              <p className="text-sm text-muted-foreground">
                {sortedMessages.length} personalized {sortedMessages.length === 1 ? 'message' : 'messages'} generated
              </p>
            </div>
            {sortedMessages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Clear History
              </Button>
            )}
          </div>

          {currentWelcome && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card/80 to-card/60">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 -z-10" />
                <div className="absolute inset-0 grid-pattern opacity-10 -z-10" />
                
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{moodEmojis[currentWelcome.mood]}</div>
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2">Current Message</Badge>
                      <h4 className="text-xl font-bold mb-2">{currentWelcome.greeting}</h4>
                      <p className="text-muted-foreground">{currentWelcome.message}</p>
                      <div className="flex items-center gap-2 mt-4">
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="w-3 h-3" />
                          Just now
                        </Badge>
                        <Badge variant="secondary" className="capitalize gap-1">
                          <Star className="w-3 h-3" />
                          {currentWelcome.mood}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <Separator className="my-6" />

          <ScrollArea className="h-[600px] pr-4">
            {sortedMessages.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Your welcome message history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedMessages.map((message, index) => {
                  const MoodIcon = moodIcons[message.mood]
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
                          selectedMessage?.id === message.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => handleViewMessage(message)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${moodColors[message.mood]}`}>
                            <MoodIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-semibold truncate">{message.greeting}</h5>
                              <Badge variant="outline" className="capitalize shrink-0 text-xs">
                                {message.mood}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {message.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(message.timestamp).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <span>•</span>
                                <span className="capitalize">{message.personalityType}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 h-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewMessage(message)
                                }}
                              >
                                <Eye className="w-3 h-3" />
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <AnimatePresence mode="wait">
          {selectedMessage ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className="p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold">Message Details</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMessage(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      Timestamp
                    </p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">
                        {new Date(selectedMessage.timestamp).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      Mood
                    </p>
                    <Badge variant="outline" className="capitalize">
                      {moodEmojis[selectedMessage.mood]} {selectedMessage.mood}
                    </Badge>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      Personality Type
                    </p>
                    <Badge variant="outline" className="capitalize">
                      {selectedMessage.personalityType}
                    </Badge>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
                      Stats at Time
                    </p>
                    <div className="space-y-3">
                      <Card className="p-3 bg-secondary/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Agents</span>
                          <span className="font-bold">{selectedMessage.stats.agentCount}</span>
                        </div>
                      </Card>
                      <Card className="p-3 bg-secondary/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Transactions</span>
                          <span className="font-bold">{selectedMessage.stats.transactionCount}</span>
                        </div>
                      </Card>
                      <Card className="p-3 bg-secondary/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total Spent</span>
                          <span className="font-bold">{selectedMessage.stats.totalSpent.toFixed(2)} Ⓜ</span>
                        </div>
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      Full Message
                    </p>
                    <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5">
                      <p className="text-sm leading-relaxed">{selectedMessage.message}</p>
                    </Card>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-8 text-center sticky top-6">
                <Info className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Select a message to view details
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
