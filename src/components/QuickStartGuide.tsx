import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Robot, Package, ChartLine, X, Trophy } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface QuickStartGuideProps {
  onListService: () => void
  onViewAgents: () => void
  onViewBundles: () => void
  onViewAnalytics: () => void
  onViewLeaderboard?: () => void
}

export default function QuickStartGuide({ 
  onListService, 
  onViewAgents, 
  onViewBundles, 
  onViewAnalytics,
  onViewLeaderboard
}: QuickStartGuideProps) {
  const [showQuickStart, setShowQuickStart] = useKV<boolean>('show-quick-start', true)

  if (!showQuickStart) return null

  const quickActions = [
    {
      icon: <Plus className="w-6 h-6" />,
      title: 'List a Service',
      description: 'Start earning by offering your AI services',
      action: onListService,
      color: 'from-primary/20 to-primary/5',
    },
    {
      icon: <Robot className="w-6 h-6" />,
      title: 'Create an Agent',
      description: 'Set up autonomous AI agents for purchases',
      action: onViewAgents,
      color: 'from-accent/20 to-accent/5',
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Browse Bundles',
      description: 'Save with service package deals',
      action: onViewBundles,
      color: 'from-purple-500/20 to-purple-500/5',
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'View Leaderboard',
      description: 'See top users and earn achievements',
      action: onViewLeaderboard,
      color: 'from-yellow-500/20 to-yellow-500/5',
    },
    {
      icon: <ChartLine className="w-6 h-6" />,
      title: 'View Analytics',
      description: 'Track marketplace performance',
      action: onViewAnalytics,
      color: 'from-cyan-500/20 to-cyan-500/5',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="relative p-6 bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/20 mb-6">
        <button
          onClick={() => setShowQuickStart(false)}
          className="absolute top-4 right-4 p-1 rounded hover:bg-secondary/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Quick Start Guide</h3>
          <p className="text-sm text-muted-foreground">
            Get started with these essential actions to make the most of the marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
            >
              <button
                onClick={action.action}
                className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/50 transition-all group bg-gradient-to-br hover:shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                }}
              >
                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${action.color} mb-3 text-primary group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h4 className="font-semibold mb-1 text-sm">{action.title}</h4>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </button>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
