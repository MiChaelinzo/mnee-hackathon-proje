import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Storefront, 
  TrendUp, 
  Star, 
  CurrencyDollar, 
  ShoppingCart,
  ChartLine,
  Crown
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { Service, Transaction, ServiceReview, ProviderStats } from '@/lib/types'

interface ProviderDashboardProps {
  services: Service[]
  transactions: Transaction[]
  reviews: ServiceReview[]
}

export default function ProviderDashboard({
  services,
  transactions,
  reviews,
}: ProviderDashboardProps) {
  const providerStats = useMemo(() => {
    const statsMap = new Map<string, ProviderStats>()

    services.forEach(service => {
      if (!statsMap.has(service.provider)) {
        statsMap.set(service.provider, {
          providerId: service.providerAddress,
          providerName: service.provider,
          totalRevenue: 0,
          totalSales: 0,
          averageRating: 0,
          totalReviews: 0,
          topService: '',
          servicesCount: 0,
        })
      }
    })

    transactions
      .filter(t => t.status === 'completed')
      .forEach(transaction => {
        const service = services.find(s => s.id === transaction.serviceId)
        if (!service) return

        const stats = statsMap.get(service.provider)
        if (stats) {
          stats.totalRevenue += transaction.amount
          stats.totalSales += 1
        }
      })

    services.forEach(service => {
      const stats = statsMap.get(service.provider)
      if (stats) {
        stats.servicesCount += 1
        
        const serviceReviews = reviews.filter(r => r.serviceId === service.id)
        stats.totalReviews += serviceReviews.length
        
        if (serviceReviews.length > 0) {
          const avgRating = serviceReviews.reduce((acc, r) => acc + r.rating, 0) / serviceReviews.length
          stats.averageRating = (stats.averageRating * (stats.servicesCount - 1) + avgRating) / stats.servicesCount
        }
      }
    })

    statsMap.forEach(stats => {
      const providerServices = services.filter(s => s.provider === stats.providerName)
      const topService = providerServices.reduce((top, current) => 
        current.sales > top.sales ? current : top
      , providerServices[0])
      stats.topService = topService?.name || 'N/A'
    })

    return Array.from(statsMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
  }, [services, transactions, reviews])

  const topProviders = providerStats.slice(0, 5)
  const totalMarketplaceRevenue = providerStats.reduce((acc, p) => acc + p.totalRevenue, 0)
  const totalMarketplaceSales = providerStats.reduce((acc, p) => acc + p.totalSales, 0)

  const categoryBreakdown = useMemo(() => {
    const breakdown = new Map<string, { sales: number; revenue: number }>()
    
    services.forEach(service => {
      if (!breakdown.has(service.category)) {
        breakdown.set(service.category, { sales: 0, revenue: 0 })
      }
      const data = breakdown.get(service.category)!
      data.sales += service.sales
      
      const serviceTransactions = transactions
        .filter(t => t.serviceId === service.id && t.status === 'completed')
      data.revenue += serviceTransactions.reduce((acc, t) => acc + t.amount, 0)
    })

    return Array.from(breakdown.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [services, transactions])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Storefront className="w-8 h-8" />
          Provider Analytics
        </h2>
        <p className="text-muted-foreground">
          Marketplace-wide performance metrics and provider insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CurrencyDollar className="w-5 h-5 text-accent" />
              <span className="text-2xl font-bold">
                {totalMarketplaceRevenue.toFixed(2)} MNEE
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across all providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{totalMarketplaceSales}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Completed transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Storefront className="w-5 h-5 text-accent" />
              <span className="text-2xl font-bold">{providerStats.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Selling services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" weight="fill" />
              <span className="text-2xl font-bold">
                {providerStats.length > 0
                  ? (providerStats.reduce((acc, p) => acc + p.averageRating, 0) / providerStats.length).toFixed(1)
                  : '0.0'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Platform average
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="providers" className="gap-2">
            <Crown className="w-4 h-4" />
            Top Providers
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <ChartLine className="w-4 h-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-accent" />
                Top Performing Providers
              </CardTitle>
              <CardDescription>
                Leading service providers by revenue and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProviders.map((provider, index) => (
                  <motion.div
                    key={provider.providerId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-secondary/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{provider.providerName}</h4>
                          <p className="text-xs text-muted-foreground font-mono">
                            {provider.providerId.slice(0, 10)}...{provider.providerId.slice(-8)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        {index === 0 ? 'Top Provider' : `Rank ${index + 1}`}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Revenue</p>
                        <p className="font-bold text-accent">
                          {provider.totalRevenue.toFixed(2)} MNEE
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Sales</p>
                        <p className="font-bold">{provider.totalSales}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Services</p>
                        <p className="font-bold">{provider.servicesCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-accent" weight="fill" />
                          <p className="font-bold">{provider.averageRating.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Top Service</p>
                      <p className="text-sm font-medium">{provider.topService}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartLine className="w-5 h-5 text-primary" />
                Category Performance
              </CardTitle>
              <CardDescription>
                Sales and revenue breakdown by service category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {categoryBreakdown.map((category, index) => {
                  const revenuePercent = totalMarketplaceRevenue > 0
                    ? (category.revenue / totalMarketplaceRevenue) * 100
                    : 0

                  return (
                    <motion.div
                      key={category.category}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{category.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {category.sales} sales
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-accent">
                            {category.revenue.toFixed(2)} MNEE
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {revenuePercent.toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                      <Progress value={revenuePercent} className="h-2" />
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
