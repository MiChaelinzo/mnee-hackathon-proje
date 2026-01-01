import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendUp, TrendDown, Lightning, CurrencyCircleDollar, ChartLine } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { Agent, Transaction } from '@/lib/types'

interface AgentAnalyticsProps {
  agents: Agent[]
  transactions: Transaction[]
}

export default function AgentAnalytics({ agents, transactions }: AgentAnalyticsProps) {
  const analytics = useMemo(() => {
    const totalAgents = agents.length
    const activeAgents = agents.filter(a => a.isActive).length
    const totalBalance = agents.reduce((sum, a) => sum + a.balance, 0)
    const totalSpent = agents.reduce((sum, a) => sum + a.totalSpent, 0)
    
    const recentTransactions = transactions.filter(
      t => t.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000
    )
    const recentSpending = recentTransactions.reduce((sum, t) => sum + t.amount, 0)
    
    const prevWeekStart = Date.now() - 14 * 24 * 60 * 60 * 1000
    const prevWeekEnd = Date.now() - 7 * 24 * 60 * 60 * 1000
    const prevWeekTransactions = transactions.filter(
      t => t.timestamp > prevWeekStart && t.timestamp <= prevWeekEnd
    )
    const prevWeekSpending = prevWeekTransactions.reduce((sum, t) => sum + t.amount, 0)
    
    const spendingTrend = prevWeekSpending > 0 
      ? ((recentSpending - prevWeekSpending) / prevWeekSpending) * 100
      : recentSpending > 0 ? 100 : 0

    const mostActiveAgent = agents.length > 0
      ? agents.reduce((max, agent) => agent.purchaseCount > max.purchaseCount ? agent : max, agents[0])
      : null

    const avgTransactionSize = transactions.length > 0
      ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
      : 0

    return {
      totalAgents,
      activeAgents,
      totalBalance,
      totalSpent,
      recentSpending,
      spendingTrend,
      mostActiveAgent,
      avgTransactionSize,
    }
  }, [agents, transactions])

  const stats = [
    {
      title: 'Total Agents',
      value: analytics.totalAgents,
      subtitle: `${analytics.activeAgents} active`,
      icon: Robot,
      color: 'primary',
    },
    {
      title: 'Combined Balance',
      value: analytics.totalBalance.toFixed(0),
      subtitle: 'MNEE available',
      icon: CurrencyCircleDollar,
      color: 'accent',
      isCurrency: true,
    },
    {
      title: 'Total Spent',
      value: analytics.totalSpent.toFixed(0),
      subtitle: 'MNEE',
      icon: ChartLine,
      color: 'secondary',
      isCurrency: true,
    },
    {
      title: 'Weekly Trend',
      value: analytics.spendingTrend > 0 ? `+${analytics.spendingTrend.toFixed(1)}%` : `${analytics.spendingTrend.toFixed(1)}%`,
      subtitle: 'vs last week',
      icon: analytics.spendingTrend >= 0 ? TrendUp : TrendDown,
      color: analytics.spendingTrend >= 0 ? 'accent' : 'destructive',
      trend: analytics.spendingTrend,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`border-${stat.color}/20 hover:shadow-lg transition-all`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-8 h-8 rounded-lg bg-${stat.color}/20 flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 text-${stat.color}`} weight="bold" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className={`text-2xl font-bold ${stat.isCurrency ? 'font-mono' : ''}`}>
                    {stat.value}
                  </div>
                  {stat.trend !== undefined && (
                    <Badge 
                      variant="outline" 
                      className={`${
                        stat.trend >= 0 
                          ? 'bg-accent/10 text-accent border-accent/30' 
                          : 'bg-destructive/10 text-destructive border-destructive/30'
                      }`}
                    >
                      {stat.trend >= 0 ? '↑' : '↓'}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {analytics.mostActiveAgent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Lightning className="w-5 h-5 text-accent" weight="fill" />
                </div>
                <div>
                  <CardTitle className="text-lg">Most Active Agent</CardTitle>
                  <p className="text-sm text-muted-foreground">Top performer this period</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Agent Name</p>
                  <p className="font-bold text-lg">{analytics.mostActiveAgent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Purchases</p>
                  <p className="font-bold text-lg text-accent">{analytics.mostActiveAgent.purchaseCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                  <p className="font-bold text-lg font-mono">{analytics.mostActiveAgent.totalSpent.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Balance</p>
                  <p className="font-bold text-lg font-mono">{analytics.mostActiveAgent.balance.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Avg Transaction</p>
                <p className="font-bold font-mono">{analytics.avgTransactionSize.toFixed(2)} MNEE</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">This Week</p>
                <p className="font-bold font-mono">{analytics.recentSpending.toFixed(2)} MNEE</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Total Transactions</p>
                <p className="font-bold">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

import { Robot } from '@phosphor-icons/react'
