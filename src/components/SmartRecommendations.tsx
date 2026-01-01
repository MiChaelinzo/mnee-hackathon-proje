import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Sparkle, 
  Star,
  CurrencyDollar,
  ShoppingCart,
  TrendUp,
  Robot,
  Target,
  CheckCircle,
  Lightbulb
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { Service, Agent, Transaction } from '@/lib/types'

interface SmartRecommendationsProps {
  agent: Agent
  services: Service[]
  transactions: Transaction[]
  onPurchase: (serviceId: string) => void
}

interface Recommendation {
  service: Service
  score: number
  reasons: string[]
  category: string
}

export default function SmartRecommendations({ 
  agent, 
  services, 
  transactions,
  onPurchase 
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateRecommendations = async () => {
    setIsGenerating(true)

    try {
      const agentTransactions = transactions.filter(tx => tx.agentId === agent.id)
      const purchasedServices = agentTransactions.map(tx => tx.serviceId)
      const availableServices = services.filter(s => !purchasedServices.includes(s.id) && s.available)

      const purchaseHistory = agentTransactions.map(tx => {
        const service = services.find(s => s.id === tx.serviceId)
        return {
          serviceName: service?.name || 'Unknown',
          category: service?.category || 'Unknown',
          price: tx.amount,
          date: new Date(tx.timestamp).toISOString()
        }
      })

      const prompt = window.spark.llmPrompt`You are an AI recommendation engine for an agent marketplace. Analyze the agent's purchase history and recommend the top 5 services they should consider.

Agent Profile:
- Name: ${agent.name}
- Total Spent: $${agent.totalSpent}
- Purchase Count: ${agent.purchaseCount}
- Balance: $${agent.balance}

Purchase History:
${JSON.stringify(purchaseHistory, null, 2)}

Available Services:
${availableServices.slice(0, 20).map(s => `- ${s.name} (${s.category}) - $${s.price}, Rating: ${s.rating}★, Sales: ${s.sales}`).join('\n')}

Provide recommendations as a JSON array with this structure:
{
  "recommendations": [
    {
      "serviceId": "<service_id>",
      "score": <0-100>,
      "reasons": ["<reason1>", "<reason2>", "<reason3>"]
    }
  ]
}

Consider:
1. Purchase pattern analysis
2. Complementary services
3. Budget alignment
4. Category preferences
5. Value for money`

      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const result = JSON.parse(response)

      const recs: Recommendation[] = result.recommendations
        .map((rec: any) => {
          const service = availableServices.find(s => s.id === rec.serviceId)
          if (!service) return null
          
          return {
            service,
            score: rec.score,
            reasons: rec.reasons,
            category: service.category
          }
        })
        .filter(Boolean)
        .slice(0, 5)

      setRecommendations(recs)
      toast.success('Recommendations generated!')
    } catch (error) {
      console.error('Recommendation error:', error)
      
      const fallbackRecs = services
        .filter(s => s.available)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map(service => ({
          service,
          score: Math.floor(service.rating * 20),
          reasons: [
            `Highly rated service (${service.rating}★)`,
            `Popular with ${service.sales} purchases`,
            `${service.category} category service`
          ],
          category: service.category
        }))
      
      setRecommendations(fallbackRecs)
      toast.success('Showing popular recommendations')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkle className="w-5 h-5 text-primary" />
              AI Smart Recommendations
            </CardTitle>
            <CardDescription>
              Personalized service suggestions for {agent.name}
            </CardDescription>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkle className="w-4 h-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {recommendations.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 text-muted-foreground"
            >
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recommendations yet</p>
              <p className="text-sm mt-1">Click Generate to get AI-powered suggestions</p>
            </motion.div>
          ) : (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 rounded-lg border-2 border-border bg-card hover:bg-accent/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-accent text-accent-foreground' : 'bg-muted text-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{rec.service.name}</h3>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge variant="outline">{rec.category}</Badge>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span>{rec.service.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{rec.service.sales} sales</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {rec.service.description}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="flex items-center gap-1 font-bold text-xl mb-1">
                        <CurrencyDollar className="w-5 h-5" />
                        {rec.service.price}
                      </div>
                      <Progress value={rec.score} className="w-20 h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{rec.score}% match</p>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Why we recommend this:
                    </p>
                    {rec.reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => onPurchase(rec.service.id)}
                      className="flex-1 gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Purchase
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Target className="w-4 h-4" />
                      Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
