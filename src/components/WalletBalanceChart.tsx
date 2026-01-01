import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Coins, TrendUp, Clock, Calendar } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export interface BalanceSnapshot {
  timestamp: number
  onChainBalance: number
  testBalance: number
  totalBalance: number
}

interface WalletBalanceChartProps {
  currentOnChainBalance: number
  currentTestBalance: number
}

export default function WalletBalanceChart({ 
  currentOnChainBalance, 
  currentTestBalance 
}: WalletBalanceChartProps) {
  const [balanceHistory, setBalanceHistory] = useKV<BalanceSnapshot[]>('balance-history', [])
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')

  useEffect(() => {
    const now = Date.now()
    const currentTotal = currentOnChainBalance + currentTestBalance

    setBalanceHistory((current = []) => {
      const lastSnapshot = current[current.length - 1]
      
      const shouldAddSnapshot = 
        !lastSnapshot || 
        now - lastSnapshot.timestamp > 5 * 60 * 1000 ||
        Math.abs(lastSnapshot.totalBalance - currentTotal) > 0.01

      if (shouldAddSnapshot) {
        const newSnapshot: BalanceSnapshot = {
          timestamp: now,
          onChainBalance: currentOnChainBalance,
          testBalance: currentTestBalance,
          totalBalance: currentTotal,
        }
        
        return [...current, newSnapshot].slice(-500)
      }
      
      return current
    })
  }, [currentOnChainBalance, currentTestBalance])

  const getFilteredData = () => {
    const now = Date.now()
    let cutoffTime = 0

    switch (timeRange) {
      case '24h':
        cutoffTime = now - 24 * 60 * 60 * 1000
        break
      case '7d':
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000
        break
      case '30d':
        cutoffTime = now - 30 * 24 * 60 * 60 * 1000
        break
      case 'all':
        cutoffTime = 0
        break
    }

    const filtered = (balanceHistory || []).filter(snapshot => snapshot.timestamp >= cutoffTime)
    
    return filtered.map(snapshot => ({
      ...snapshot,
      date: new Date(snapshot.timestamp).toLocaleDateString(),
      time: new Date(snapshot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }))
  }

  const chartData = getFilteredData()

  const stats = {
    totalCurrent: currentOnChainBalance + currentTestBalance,
    onChainPercentage: currentOnChainBalance + currentTestBalance > 0 
      ? (currentOnChainBalance / (currentOnChainBalance + currentTestBalance) * 100).toFixed(1)
      : '0',
    testPercentage: currentOnChainBalance + currentTestBalance > 0
      ? (currentTestBalance / (currentOnChainBalance + currentTestBalance) * 100).toFixed(1)
      : '0',
    dataPoints: chartData.length,
  }

  const formatTooltipValue = (value: number) => `${value.toFixed(2)} MNEE`

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="font-semibold mb-2 text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-mono font-semibold">{formatTooltipValue(entry.value)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendUp className="w-5 h-5 text-primary" />
              Wallet Balance History
            </CardTitle>
            <CardDescription className="mt-2">
              Track your on-chain and test MNEE balances over time
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeRange === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('24h')}
            >
              <Clock className="w-4 h-4 mr-1" />
              24h
            </Button>
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              <Calendar className="w-4 h-4 mr-1" />
              7d
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              30d
            </Button>
            <Button
              variant={timeRange === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('all')}
            >
              All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-primary/10 rounded-lg p-4 border border-primary/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Total Balance</span>
            </div>
            <p className="text-2xl font-bold font-mono">{stats.totalCurrent.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">MNEE</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-accent/10 rounded-lg p-4 border border-accent/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-[oklch(0.6_0.18_245)]" />
              <span className="text-xs font-medium text-muted-foreground">On-Chain MNEE</span>
            </div>
            <p className="text-2xl font-bold font-mono">{currentOnChainBalance.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.onChainPercentage}% of total</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-accent/10 rounded-lg p-4 border border-accent/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-[oklch(0.85_0.2_140)]" />
              <span className="text-xs font-medium text-muted-foreground">Test MNEE</span>
            </div>
            <p className="text-2xl font-bold font-mono">{currentTestBalance.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.testPercentage}% of total</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-muted/50 rounded-lg p-4 border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Data Points</span>
            </div>
            <p className="text-2xl font-bold">{stats.dataPoints}</p>
            <p className="text-xs text-muted-foreground mt-1">Snapshots recorded</p>
          </motion.div>
        </div>

        <Tabs defaultValue="area" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="area">Area Chart</TabsTrigger>
            <TabsTrigger value="line">Line Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="area" className="space-y-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey={timeRange === '24h' ? 'time' : 'date'}
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                    label={{ value: 'MNEE', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="onChainBalance"
                    stackId="1"
                    stroke="oklch(0.6 0.18 245)"
                    fill="oklch(0.6 0.18 245)"
                    fillOpacity={0.6}
                    name="On-Chain MNEE"
                  />
                  <Area
                    type="monotone"
                    dataKey="testBalance"
                    stackId="1"
                    stroke="oklch(0.85 0.2 140)"
                    fill="oklch(0.85 0.2 140)"
                    fillOpacity={0.6}
                    name="Test MNEE"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center border border-dashed border-border rounded-lg">
                <div className="text-center">
                  <TrendUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No balance history yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Balance snapshots will appear here as you use the platform
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="line" className="space-y-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey={timeRange === '24h' ? 'time' : 'date'}
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                    label={{ value: 'MNEE', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalBalance"
                    stroke="oklch(0.6 0.18 245)"
                    strokeWidth={3}
                    dot={{ fill: 'oklch(0.6 0.18 245)', r: 4 }}
                    name="Total Balance"
                  />
                  <Line
                    type="monotone"
                    dataKey="onChainBalance"
                    stroke="oklch(0.6 0.18 245)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: 'oklch(0.6 0.18 245)', r: 3 }}
                    name="On-Chain MNEE"
                  />
                  <Line
                    type="monotone"
                    dataKey="testBalance"
                    stroke="oklch(0.85 0.2 140)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: 'oklch(0.85 0.2 140)', r: 3 }}
                    name="Test MNEE"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center border border-dashed border-border rounded-lg">
                <div className="text-center">
                  <TrendUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No balance history yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Balance snapshots will appear here as you use the platform
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {chartData.length > 0 && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-start gap-3">
              <TrendUp className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Balance Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Your wallet balance is automatically tracked every 5 minutes and whenever significant changes occur. 
                  The chart shows the breakdown between real on-chain MNEE tokens and test MNEE for demo purposes.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
