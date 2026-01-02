import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Package, ShoppingBag, TrendUp, Users } from '@phosphor-icons/react'
import type { Service, Transaction, Agent } from '@/lib/types'

interface MarketplaceStatsProps {
  services: Service[]
  transactions: Transaction[]
  agents: Agent[]
}

export default function MarketplaceStats({ services, transactions, agents }: MarketplaceStatsProps) {
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)
  const avgServicePrice = services.length > 0 
    ? services.reduce((sum, s) => sum + s.price, 0) / services.length 
    : 0
  const activeAgents = agents.filter(a => a.balance > 0).length

  const stats = [
    {
      icon: <Package className="w-6 h-6" />,
      label: 'Active Services',
      value: services.filter(s => s.available).length.toString(),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: <ShoppingBag className="w-6 h-6" />,
      label: 'Total Transactions',
      value: transactions.length.toString(),
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: <TrendUp className="w-6 h-6" />,
      label: 'Total Revenue',
      value: `${totalRevenue.toFixed(0)} MNEE`,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Active Agents',
      value: activeAgents.toString(),
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-border hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
