import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ChartLine, TrendUp, Fire, Crown, Package, CalendarBlank, FileCsv, FilePdf, Download } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { ServiceBundle, Subscription } from '@/lib/types'
import { generateCSV, downloadCSV, generatePDF, downloadPDF } from '@/lib/export'

interface AIRecommendationHistory {
  bundleId: string
  timestamp: number
  agentId: string
  confidence: number
  position: number
}

interface TrendData {
  bundleId: string
  count: number
  avgConfidence: number
  avgPosition: number
  lastRecommended: number
  trendDirection: 'up' | 'down' | 'stable'
}

interface AIRecommendationTrendsProps {
  bundles: ServiceBundle[]
  subscriptions: Subscription[]
}

export default function AIRecommendationTrends({ bundles, subscriptions }: AIRecommendationTrendsProps) {
  const [recommendationHistory, setRecommendationHistory] = useKV<AIRecommendationHistory[]>('ai-recommendation-history', [])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')

  useEffect(() => {
    if (!recommendationHistory || recommendationHistory.length === 0) return

    const now = Date.now()
    const timeRanges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      'all': Infinity,
    }

    const cutoff = now - timeRanges[timeRange]
    const filteredHistory = recommendationHistory.filter(h => h.timestamp >= cutoff)

    const bundleStats = new Map<string, {
      count: number
      totalConfidence: number
      totalPosition: number
      timestamps: number[]
    }>()

    filteredHistory.forEach((rec) => {
      const stats = bundleStats.get(rec.bundleId) || {
        count: 0,
        totalConfidence: 0,
        totalPosition: 0,
        timestamps: [],
      }
      stats.count++
      stats.totalConfidence += rec.confidence
      stats.totalPosition += rec.position
      stats.timestamps.push(rec.timestamp)
      bundleStats.set(rec.bundleId, stats)
    })

    const trends: TrendData[] = Array.from(bundleStats.entries()).map(([bundleId, stats]) => {
      const sortedTimestamps = stats.timestamps.sort((a, b) => a - b)
      const halfPoint = Math.floor(sortedTimestamps.length / 2)
      const firstHalf = sortedTimestamps.slice(0, halfPoint).length
      const secondHalf = sortedTimestamps.length - firstHalf

      let trendDirection: 'up' | 'down' | 'stable' = 'stable'
      if (sortedTimestamps.length >= 4) {
        if (secondHalf > firstHalf * 1.2) {
          trendDirection = 'up'
        } else if (firstHalf > secondHalf * 1.2) {
          trendDirection = 'down'
        }
      }

      return {
        bundleId,
        count: stats.count,
        avgConfidence: stats.totalConfidence / stats.count,
        avgPosition: stats.totalPosition / stats.count,
        lastRecommended: Math.max(...stats.timestamps),
        trendDirection,
      }
    })

    trends.sort((a, b) => b.count - a.count)
    setTrendData(trends)
  }, [recommendationHistory, timeRange])

  const getBundleName = (bundleId: string): { name: string; type: 'bundle' | 'subscription'; category: string; discount: number } => {
    const bundle = bundles.find((b) => b.id === bundleId)
    if (bundle) return { name: bundle.name, type: 'bundle', category: bundle.category, discount: bundle.discount }
    
    const subscription = subscriptions.find((s) => s.id === bundleId)
    if (subscription) return { name: subscription.name, type: 'subscription', category: subscription.category, discount: subscription.discount }
    
    return { name: 'Unknown Bundle', type: 'bundle', category: 'Unknown', discount: 0 }
  }

  const getTimeSinceLastRecommended = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <TrendUp className="w-4 h-4 text-accent" weight="bold" />
      case 'down':
        return <TrendUp className="w-4 h-4 text-muted-foreground rotate-180" weight="bold" />
      default:
        return <div className="w-4 h-4" />
    }
  }

  const topRecommended = trendData.slice(0, 5)
  const risingTrends = trendData.filter(t => t.trendDirection === 'up').slice(0, 5)
  const highConfidence = [...trendData].sort((a, b) => b.avgConfidence - a.avgConfidence).slice(0, 5)

  const handleExportCSV = () => {
    try {
      const csvContent = generateCSV(trendData, getBundleName, timeRange)
      const filename = `ai-recommendations-${timeRange}-${Date.now()}.csv`
      downloadCSV(csvContent, filename)
      toast.success('CSV exported successfully', {
        description: `Downloaded ${filename}`,
      })
    } catch (error) {
      toast.error('Failed to export CSV', {
        description: 'Please try again',
      })
    }
  }

  const handleExportPDF = () => {
    try {
      const totalRecs = recommendationHistory?.filter(h => {
        const cutoff = timeRange === 'all' ? 0 : Date.now() - (timeRange === '24h' ? 24 * 60 * 60 * 1000 : timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)
        return h.timestamp >= cutoff
      }).length || 0

      const htmlContent = generatePDF(trendData, getBundleName, timeRange, totalRecs)
      const filename = `ai-recommendations-${timeRange}-${Date.now()}.html`
      downloadPDF(htmlContent, filename)
      toast.success('PDF report opened', {
        description: 'Use your browser print dialog to save as PDF',
      })
    } catch (error) {
      toast.error('Failed to generate PDF', {
        description: 'Please try again',
      })
    }
  }

  if (trendData.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ChartLine className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No recommendation data yet
            <br />
            AI recommendations will appear here as they are generated
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <ChartLine className="w-6 h-6 text-primary" weight="bold" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">AI Recommendation Trends</h3>
            <p className="text-sm text-muted-foreground">
              Historical analysis of AI-powered bundle recommendations
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Time Range:</span>
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {(['24h', '7d', '30d', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                    timeRange === range
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range === 'all' ? 'All Time' : range}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="gap-2 flex-1 sm:flex-initial"
            >
              <FileCsv className="w-4 h-4" />
              Export CSV
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="gap-2 flex-1 sm:flex-initial"
            >
              <FilePdf className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Recommendations</p>
                <p className="text-3xl font-bold">
                  {recommendationHistory?.filter(h => {
                    const cutoff = timeRange === 'all' ? 0 : Date.now() - (timeRange === '24h' ? 24 * 60 * 60 * 1000 : timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)
                    return h.timestamp >= cutoff
                  }).length || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Fire className="w-5 h-5 text-accent" weight="fill" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Unique Bundles</p>
                <p className="text-3xl font-bold">{trendData.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-border">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Confidence</p>
                <p className="text-3xl font-bold">
                  {trendData.length > 0 ? Math.round(trendData.reduce((sum, t) => sum + t.avgConfidence, 0) / trendData.length) : 0}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <TrendUp className="w-5 h-5 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="top" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-grid">
          <TabsTrigger value="top" className="gap-2">
            <Crown className="w-4 h-4" />
            Most Recommended
          </TabsTrigger>
          <TabsTrigger value="rising" className="gap-2">
            <TrendUp className="w-4 h-4" />
            Rising Trends
          </TabsTrigger>
          <TabsTrigger value="confidence" className="gap-2">
            <Fire className="w-4 h-4" />
            High Confidence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="top" className="space-y-3">
          {topRecommended.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No data available for this time range
              </CardContent>
            </Card>
          ) : (
            topRecommended.map((trend, index) => {
              const bundleInfo = getBundleName(trend.bundleId)
              return (
                <motion.div
                  key={trend.bundleId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow border-border/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            index === 0 ? 'bg-accent/20' : 'bg-muted'
                          }`}>
                            <span className="text-lg font-bold">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <CardTitle className="text-lg">{bundleInfo.name}</CardTitle>
                              {index === 0 && (
                                <Badge className="bg-accent text-accent-foreground">
                                  <Crown className="w-3 h-3 mr-1" weight="fill" />
                                  Top Pick
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {bundleInfo.category}
                              </Badge>
                              {bundleInfo.type === 'subscription' && (
                                <Badge variant="outline" className="text-xs">
                                  <CalendarBlank className="w-3 h-3 mr-1" />
                                  Subscription
                                </Badge>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getTrendIcon(trend.trendDirection)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Recommendations</p>
                          <p className="text-2xl font-bold text-accent">{trend.count}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Avg Confidence</p>
                          <p className="text-2xl font-bold font-mono">{Math.round(trend.avgConfidence)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Avg Position</p>
                          <p className="text-2xl font-bold">#{Math.round(trend.avgPosition)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Last Seen</p>
                          <p className="text-lg font-medium">{getTimeSinceLastRecommended(trend.lastRecommended)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="rising" className="space-y-3">
          {risingTrends.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No rising trends detected in this time range
              </CardContent>
            </Card>
          ) : (
            risingTrends.map((trend, index) => {
              const bundleInfo = getBundleName(trend.bundleId)
              return (
                <motion.div
                  key={trend.bundleId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                            <TrendUp className="w-5 h-5 text-accent" weight="bold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <CardTitle className="text-lg">{bundleInfo.name}</CardTitle>
                              <Badge className="bg-accent text-accent-foreground">
                                Trending Up
                              </Badge>
                            </div>
                            <CardDescription className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {bundleInfo.category}
                              </Badge>
                              {bundleInfo.type === 'subscription' && (
                                <Badge variant="outline" className="text-xs">
                                  <CalendarBlank className="w-3 h-3 mr-1" />
                                  Subscription
                                </Badge>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Recommendations</p>
                          <p className="text-2xl font-bold text-accent">{trend.count}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Avg Confidence</p>
                          <p className="text-2xl font-bold font-mono">{Math.round(trend.avgConfidence)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Avg Position</p>
                          <p className="text-2xl font-bold">#{Math.round(trend.avgPosition)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Last Seen</p>
                          <p className="text-lg font-medium">{getTimeSinceLastRecommended(trend.lastRecommended)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="confidence" className="space-y-3">
          {highConfidence.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No data available for this time range
              </CardContent>
            </Card>
          ) : (
            highConfidence.map((trend, index) => {
              const bundleInfo = getBundleName(trend.bundleId)
              return (
                <motion.div
                  key={trend.bundleId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                            <Fire className="w-5 h-5 text-primary" weight="fill" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <CardTitle className="text-lg">{bundleInfo.name}</CardTitle>
                              {trend.avgConfidence >= 90 && (
                                <Badge className="bg-primary text-primary-foreground">
                                  <Fire className="w-3 h-3 mr-1" weight="fill" />
                                  High Confidence
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {bundleInfo.category}
                              </Badge>
                              {bundleInfo.type === 'subscription' && (
                                <Badge variant="outline" className="text-xs">
                                  <CalendarBlank className="w-3 h-3 mr-1" />
                                  Subscription
                                </Badge>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getTrendIcon(trend.trendDirection)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Recommendations</p>
                          <p className="text-2xl font-bold text-accent">{trend.count}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Avg Confidence</p>
                          <p className="text-2xl font-bold font-mono text-primary">{Math.round(trend.avgConfidence)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Avg Position</p>
                          <p className="text-2xl font-bold">#{Math.round(trend.avgPosition)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Last Seen</p>
                          <p className="text-lg font-medium">{getTimeSinceLastRecommended(trend.lastRecommended)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
