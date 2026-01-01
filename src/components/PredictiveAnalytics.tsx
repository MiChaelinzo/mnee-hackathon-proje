import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendUp, TrendDown, Sparkle, ChartLine, Target, Clock } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { Agent, Transaction, Service } from '@/lib/types'

interface PredictionData {
  timeframe: '30d' | '60d' | '90d'
  projectedSpending: number
  confidence: number
  categoryBreakdown: { category: string; amount: number; percentage: number }[]
  likelyServices: { service: Service; probability: number; reasoning: string }[]
  budgetRecommendation: {
    current: number
    recommended: number
    reasoning: string
  }
  spendingTrend: 'increasing' | 'stable' | 'decreasing'
}

interface PredictiveAnalyticsProps {
  agent: Agent
  transactions: Transaction[]
  services: Service[]
}

export default function PredictiveAnalytics({
  agent,
  transactions,
  services,
}: PredictiveAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'30d' | '60d' | '90d'>('30d')
  const [prediction, setPrediction] = useState<PredictionData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const agentTransactions = transactions.filter(t => t.agentId === agent.id)

  const generatePrediction = async () => {
    setIsAnalyzing(true)

    try {
      const recentTransactions = agentTransactions
        .slice(0, 20)
        .map(t => ({
          serviceName: t.serviceName,
          amount: t.amount,
          timestamp: t.timestamp,
        }))

      const timeframeMultiplier = timeframe === '30d' ? 1 : timeframe === '60d' ? 2 : 3

      const prompt = window.spark.llmPrompt`You are a financial analyst AI predicting agent spending patterns.

Agent: ${agent.name}
Current Balance: ${agent.balance} MNEE
Total Spent: ${agent.totalSpent} MNEE
Purchase Count: ${agent.purchaseCount}
Spending Limit: ${agent.spendingLimit} MNEE

Recent Transactions (last ${recentTransactions.length}):
${JSON.stringify(recentTransactions, null, 2)}

Available Services:
${JSON.stringify(services.map(s => ({ name: s.name, category: s.category, price: s.price })), null, 2)}

Analyze the agent's behavior and predict spending for the next ${timeframe}. Return ONLY valid JSON:
{
  "projectedSpending": <number>,
  "confidence": <0-100>,
  "categoryBreakdown": [
    {"category": "Data Analysis", "amount": <number>, "percentage": <0-100>}
  ],
  "likelyServices": [
    {"serviceName": "Service Name", "probability": <0-100>, "reasoning": "why"}
  ],
  "budgetRecommendation": {
    "current": ${agent.spendingLimit},
    "recommended": <number>,
    "reasoning": "why"
  },
  "spendingTrend": "increasing|stable|decreasing"
}`

      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const parsed = JSON.parse(response)

      const likelyServices = parsed.likelyServices
        .map((ls: any) => {
          const service = services.find(s => s.name === ls.serviceName)
          if (!service) return null
          return {
            service,
            probability: ls.probability,
            reasoning: ls.reasoning,
          }
        })
        .filter(Boolean)
        .slice(0, 5)

      setPrediction({
        timeframe,
        projectedSpending: parsed.projectedSpending,
        confidence: parsed.confidence,
        categoryBreakdown: parsed.categoryBreakdown,
        likelyServices,
        budgetRecommendation: parsed.budgetRecommendation,
        spendingTrend: parsed.spendingTrend,
      })
    } catch (error) {
      console.error('Prediction error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    if (agentTransactions.length >= 3) {
      generatePrediction()
    }
  }, [timeframe])

  if (agentTransactions.length < 3) {
    return (
      <Card className="p-8 text-center">
        <ChartLine className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold text-lg mb-2">Insufficient Data</h3>
        <p className="text-muted-foreground text-sm">
          At least 3 transactions are needed to generate predictions.
          <br />
          Current transactions: {agentTransactions.length}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">Predictive Analytics</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered spending forecasts for {agent.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['30d', '60d', '90d'] as const).map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
          <Button onClick={generatePrediction} disabled={isAnalyzing} className="gap-2">
            <Sparkle className="w-4 h-4" />
            {isAnalyzing ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {isAnalyzing ? (
        <Card className="p-12 flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkle className="w-16 h-16 text-primary mb-4" />
          </motion.div>
          <p className="text-muted-foreground">Analyzing spending patterns...</p>
        </Card>
      ) : prediction ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4 bg-gradient-to-br from-card to-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">Projected Spending</h4>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {prediction.confidence}% Confidence
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold font-mono text-primary">
                  {prediction.projectedSpending.toFixed(2)}
                </span>
                <span className="text-2xl font-mono text-muted-foreground">MNEE</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {prediction.spendingTrend === 'increasing' ? (
                  <>
                    <TrendUp className="w-4 h-4 text-destructive" />
                    <span className="text-destructive">Increasing trend</span>
                  </>
                ) : prediction.spendingTrend === 'decreasing' ? (
                  <>
                    <TrendDown className="w-4 h-4 text-accent" />
                    <span className="text-accent">Decreasing trend</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Stable pattern</span>
                  </>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-lg">Budget Recommendation</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Limit:</span>
                <span className="font-mono font-semibold">
                  {prediction.budgetRecommendation.current} MNEE
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Recommended:</span>
                <span className="font-mono font-bold text-accent text-lg">
                  {prediction.budgetRecommendation.recommended} MNEE
                </span>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground italic">
                  {prediction.budgetRecommendation.reasoning}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h4 className="font-semibold text-lg">Category Breakdown</h4>
            <div className="space-y-3">
              {prediction.categoryBreakdown.map((cat, index) => (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-1"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{cat.category}</span>
                    <span className="font-mono text-muted-foreground">
                      {cat.amount.toFixed(2)} MNEE ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="h-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h4 className="font-semibold text-lg">Likely Services</h4>
            <div className="space-y-3">
              {prediction.likelyServices.map((ls, index) => (
                <motion.div
                  key={ls.service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 bg-muted/50 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{ls.service.name}</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {ls.probability}% likely
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground italic">{ls.reasoning}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Click "Refresh" to generate predictions</p>
        </Card>
      )}
    </div>
  )
}
