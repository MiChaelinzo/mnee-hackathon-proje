import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendUp, Package, CurrencyCircleDollar, ShoppingCart } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { Service, Transaction } from '@/lib/types'

interface EnhancedServiceStatsProps {
  services: Service[]
  transactions: Transaction[]
}

export default function EnhancedServiceStats({ services, transactions }: EnhancedServiceStatsProps) {
  const stats = useMemo(() => {
    const totalServices = services.length
    const activeServices = services.filter(s => s.available).length
    const totalSales = transactions.filter(t => t.status === 'completed').length
    const totalRevenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const categoryBreakdown = services.reduce((acc, service) => {
      acc[service.category] = (acc[service.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topCategory = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)[0]

    const recentGrowth = transactions.filter(
      t => t.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length

    return {
      totalServices,
      activeServices,
      totalSales,
      totalRevenue,
      topCategory,
      recentGrowth,
    }
  }, [services, transactions])

  const statCards = [
    {
      title: 'Total Services',
      value: stats.totalServices,
      subtitle: `${stats.activeServices} active`,
      icon: Package,
      color: 'primary',
      gradient: 'from-primary/10 to-primary/5',
    },
    {
      title: 'Total Sales',
      value: stats.totalSales,
      subtitle: `+${stats.recentGrowth} this week`,
      icon: ShoppingCart,
      color: 'accent',
      gradient: 'from-accent/10 to-accent/5',
    },
    {
      title: 'Revenue',
      value: `${stats.totalRevenue.toFixed(0)}`,
      subtitle: 'MNEE earned',
      icon: CurrencyCircleDollar,
      color: 'secondary',
      gradient: 'from-secondary/10 to-secondary/5',
    },
    {
      title: 'Top Category',
      value: stats.topCategory?.[0] || 'N/A',
      subtitle: `${stats.topCategory?.[1] || 0} services`,
      icon: TrendUp,
      color: 'primary',
      gradient: 'from-primary/10 to-primary/5',
      isText: true,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`bg-gradient-to-br ${stat.gradient} border-${stat.color}/20 hover:shadow-lg transition-all`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 rounded-lg bg-${stat.color}/20 flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 text-${stat.color}`} weight="bold" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`${stat.isText ? 'text-xl' : 'text-3xl'} font-bold mb-1 ${stat.isText ? 'truncate' : ''}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
