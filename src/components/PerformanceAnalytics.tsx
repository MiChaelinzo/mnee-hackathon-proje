import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ChartLine, 
  TrendUp, 
  TrendDown,
  CurrencyDollar,
  ShoppingCart,
  Star,
  Users,
  Package,
  Target,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Service, Transaction, Agent, ServiceReview } from '@/lib/types'

interface PerformanceAnalyticsProps {
  services: Service[]
  transactions: Transaction[]
  agents: Agent[]
  reviews: ServiceReview[]
}

export default function PerformanceAnalytics({ 
  services, 
  transactions, 
  agents, 
  reviews 
}: PerformanceAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredTransactions = useMemo(() => {
    const now = Date.now()
    const timeRanges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      'all': Infinity
    }
    
    return transactions.filter(tx => 
      now - tx.timestamp < timeRanges[timeRange]
    )
  }, [transactions, timeRange])

  const categoryData = useMemo(() => {
    const categories = services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = {
          name: service.category,
          revenue: 0,
          sales: 0,
          avgRating: 0,
          services: 0
        }
      }
      
      const categoryTxs = filteredTransactions.filter(tx => tx.serviceId === service.id)
      const categoryRevenue = categoryTxs.reduce((sum, tx) => sum + tx.amount, 0)
      
      acc[service.category].revenue += categoryRevenue
      acc[service.category].sales += service.sales
      acc[service.category].avgRating += service.rating
      acc[service.category].services += 1
      
      return acc
    }, {} as Record<string, any>)

    return Object.values(categories).map((cat: any) => ({
      ...cat,
      avgRating: (cat.avgRating / cat.services).toFixed(2)
    }))
  }, [services, filteredTransactions])

  const revenueOverTime = useMemo(() => {
    const days = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const interval = timeRange === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    
    const data: any[] = []
    const now = Date.now()
    
    for (let i = days - 1; i >= 0; i--) {
      const timestamp = now - (i * interval)
      const txs = filteredTransactions.filter(tx => 
        tx.timestamp >= timestamp && tx.timestamp < timestamp + interval
      )
      
      data.push({
        name: timeRange === '24h' ? `${i}h ago` : `${i}d ago`,
        revenue: txs.reduce((sum, tx) => sum + tx.amount, 0),
        transactions: txs.length
      })
    }
    
    return data
  }, [filteredTransactions, timeRange])

  const topServices = useMemo(() => {
    return [...services]
      .sort((a, b) => {
        const aRevenue = filteredTransactions
          .filter(tx => tx.serviceId === a.id)
          .reduce((sum, tx) => sum + tx.amount, 0)
        const bRevenue = filteredTransactions
          .filter(tx => tx.serviceId === b.id)
          .reduce((sum, tx) => sum + tx.amount, 0)
        return bRevenue - aRevenue
      })
      .slice(0, 10)
  }, [services, filteredTransactions])

  const topAgents = useMemo(() => {
    return [...agents]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
  }, [agents])

  const metrics = useMemo(() => {
    const totalRevenue = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    const totalTransactions = filteredTransactions.length
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    const avgRating = services.reduce((sum, s) => sum + s.rating, 0) / services.length
    
    return {
      totalRevenue,
      totalTransactions,
      avgTransaction,
      avgRating,
      totalServices: services.length,
      activeAgents: agents.filter(a => a.isActive).length,
      totalReviews: reviews.length
    }
  }, [filteredTransactions, services, agents, reviews])

  const COLORS = ['#60a5fa', '#34d399', '#a78bfa', '#fbbf24', '#f87171', '#fb923c']

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ChartLine className="w-6 h-6 text-primary" />
            Performance Analytics
          </h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into marketplace performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <CurrencyDollar className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold">${metrics.totalRevenue.toFixed(2)}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                <TrendUp className="w-4 h-4" />
                <span>+12.5%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Transactions</p>
                <ShoppingCart className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold">{metrics.totalTransactions}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-blue-500">
                <TrendUp className="w-4 h-4" />
                <span>+8.3%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold">{metrics.avgRating.toFixed(2)}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-yellow-500">
                <Minus className="w-4 h-4" />
                <span>Stable</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Active Agents</p>
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold">{metrics.activeAgents}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-purple-500">
                <TrendUp className="w-4 h-4" />
                <span>+15.2%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Transaction revenue and volume trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#60a5fa" 
                  strokeWidth={2}
                  name="Revenue (MNEE)"
                />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#34d399" 
                  strokeWidth={2}
                  name="Transactions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Revenue distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Top Performing Services
            </CardTitle>
            <CardDescription>Services by revenue in selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topServices.map((service, index) => {
                const revenue = filteredTransactions
                  .filter(tx => tx.serviceId === service.id)
                  .reduce((sum, tx) => sum + tx.amount, 0)
                
                return (
                  <div 
                    key={service.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500 text-yellow-950' :
                      index === 1 ? 'bg-gray-400 text-gray-950' :
                      index === 2 ? 'bg-orange-600 text-orange-50' :
                      'bg-muted-foreground/20 text-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${revenue.toFixed(2)}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        {service.rating}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Spending Agents
            </CardTitle>
            <CardDescription>Agents by total spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topAgents.map((agent, index) => (
                <div 
                  key={agent.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-yellow-950' :
                    index === 1 ? 'bg-gray-400 text-gray-950' :
                    index === 2 ? 'bg-orange-600 text-orange-50' :
                    'bg-muted-foreground/20 text-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.purchaseCount} purchases</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${agent.totalSpent.toFixed(2)}</p>
                    <Badge variant={agent.isActive ? 'default' : 'outline'} className="text-xs">
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Metrics</CardTitle>
          <CardDescription>Detailed performance by service category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar dataKey="revenue" fill="#60a5fa" name="Revenue (MNEE)" />
              <Bar dataKey="sales" fill="#34d399" name="Total Sales" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
