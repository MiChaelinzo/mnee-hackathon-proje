import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkle, Lightning, Check, TrendUp, Robot } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { ServiceBundle, Agent, Transaction, Service } from '@/lib/types'

interface AIBundleRecommendationsProps {
  agents: Agent[]
  transactions: Transaction[]
  services: Service[]
  bundles: ServiceBundle[]
  selectedAgent: string
  onPurchase: (transaction: Transaction) => void
  walletConnected: boolean
}

interface AIRecommendation {
  bundleId: string
  confidence: number
  reasoning: string
  matchScore: number
}

interface AIRecommendationHistory {
  bundleId: string
  timestamp: number
  agentId: string
  confidence: number
  position: number
}

export default function AIBundleRecommendations({
  agents,
  transactions,
  services,
  bundles,
  selectedAgent,
  onPurchase,
  walletConnected,
}: AIBundleRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendationHistory, setRecommendationHistory] = useKV<AIRecommendationHistory[]>('ai-recommendation-history', [])

  const generateRecommendations = async () => {
    if (!selectedAgent || agents.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const agent = agents.find((a) => a.id === selectedAgent)
      if (!agent) return

      const agentTransactions = transactions.filter((t) => t.agentId === selectedAgent)
      
      const purchasedServices = agentTransactions
        .filter((t) => t.type === 'service' || !t.type)
        .map((t) => {
          const service = services.find((s) => s.id === t.serviceId)
          return service ? { name: service.name, category: service.category, price: service.price } : null
        })
        .filter(Boolean)

      const purchasedBundles = agentTransactions
        .filter((t) => t.type === 'bundle')
        .map((t) => {
          const bundle = bundles.find((b) => b.id === t.bundleId)
          return bundle ? { name: bundle.name, category: bundle.category } : null
        })
        .filter(Boolean)

      const availableBundlesInfo = bundles.map((bundle) => {
        const bundleServices = bundle.services
          .map((sid) => services.find((s) => s.id === sid))
          .filter(Boolean)
          .map((s) => ({ name: s!.name, category: s!.category }))

        return {
          id: bundle.id,
          name: bundle.name,
          category: bundle.category,
          description: bundle.description,
          price: bundle.bundlePrice,
          discount: bundle.discount,
          services: bundleServices,
        }
      })

      const promptText = `You are an AI commerce advisor analyzing purchase patterns for an AI agent marketplace.

Agent Profile:
- Name: ${agent.name}
- Total Spent: ${agent.totalSpent.toFixed(2)} MNEE
- Purchase Count: ${agent.purchaseCount}
- Current Balance: ${agent.balance.toFixed(2)} MNEE

Purchase History:
${purchasedServices.length > 0 ? `Services purchased: ${JSON.stringify(purchasedServices, null, 2)}` : 'No services purchased yet'}
${purchasedBundles.length > 0 ? `Bundles purchased: ${JSON.stringify(purchasedBundles, null, 2)}` : 'No bundles purchased yet'}

Available Bundles:
${JSON.stringify(availableBundlesInfo, null, 2)}

Task: Analyze the agent's purchase history and recommend the top 3 bundles that would be most valuable based on:
1. Purchase patterns (what services/categories they've bought)
2. Price affordability (within their spending patterns)
3. Complementary services (services that work well with what they've already purchased)
4. Value proposition (discount percentage and service variety)

Return your analysis as a valid JSON object with a "recommendations" property containing an array of exactly 3 recommendations. Each recommendation must include:
- bundleId: the bundle's ID from the available bundles list
- confidence: a number from 0-100 indicating how confident you are in this recommendation
- reasoning: a brief, specific explanation (1-2 sentences) of why this bundle matches their needs
- matchScore: a number from 0-100 indicating how well it matches their purchase patterns

Format:
{
  "recommendations": [
    {
      "bundleId": "bundle-id-here",
      "confidence": 85,
      "reasoning": "Specific reason based on their purchase history",
      "matchScore": 90
    }
  ]
}

If there's insufficient purchase history, recommend bundles that offer the best value for new users or diverse functionality.`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const result = JSON.parse(response)

      if (result.recommendations && Array.isArray(result.recommendations)) {
        const recs = result.recommendations.slice(0, 3)
        setRecommendations(recs)
        
        const timestamp = Date.now()
        const historyEntries: AIRecommendationHistory[] = recs.map((rec, index) => ({
          bundleId: rec.bundleId,
          timestamp,
          agentId: selectedAgent,
          confidence: rec.confidence,
          position: index + 1,
        }))
        
        setRecommendationHistory((current = []) => [...current, ...historyEntries])
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Error generating recommendations:', err)
      setError('Failed to generate recommendations')
      setRecommendations([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedAgent && agents.length > 0) {
      generateRecommendations()
    }
  }, [selectedAgent])

  const handleBundlePurchase = (bundleId: string) => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    const agent = agents.find((a) => a.id === selectedAgent)
    const bundle = bundles.find((b) => b.id === bundleId)
    
    if (!agent || !bundle) return

    if (agent.balance < bundle.bundlePrice) {
      toast.error('Insufficient MNEE balance')
      return
    }

    if (agent.totalSpent + bundle.bundlePrice > agent.spendingLimit) {
      toast.error('Purchase exceeds agent spending limit')
      return
    }

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      agentId: agent.id,
      agentName: agent.name,
      serviceId: bundle.id,
      serviceName: bundle.name,
      amount: bundle.bundlePrice,
      timestamp: Date.now(),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      type: 'bundle',
      bundleId: bundle.id,
    }

    onPurchase(transaction)
    toast.success(`Bundle purchased! AI-recommended for ${agent.name}`)
    
    setTimeout(() => {
      generateRecommendations()
    }, 1000)
  }

  const getServiceName = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.name || 'Service'
  }

  const recommendedBundles = recommendations
    .map((rec) => {
      const bundle = bundles.find((b) => b.id === rec.bundleId)
      return bundle ? { ...bundle, recommendation: rec } : null
    })
    .filter(Boolean)

  if (!selectedAgent || agents.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
            <Sparkle className="w-5 h-5 text-accent" weight="fill" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI-Powered Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Personalized bundles based on purchase patterns
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generateRecommendations}
          disabled={isLoading}
          className="gap-2"
        >
          <Robot className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-full">
              <CardHeader>
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !error && recommendedBundles.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          {recommendedBundles.map((item, index) => {
            const bundle = item!
            const rec = bundle.recommendation!
            
            return (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent hover:shadow-xl hover:shadow-accent/20 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -z-10" />
                  
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-accent text-accent-foreground">
                        <Sparkle className="w-3 h-3 mr-1" weight="fill" />
                        AI Pick #{index + 1}
                      </Badge>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="font-mono text-xs">
                          {rec.confidence}% match
                        </Badge>
                        <Badge className="bg-primary/20 text-primary font-mono text-xs">
                          Save {bundle.discount}%
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{bundle.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {bundle.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                      <div className="flex items-start gap-2 mb-2">
                        <TrendUp className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <p className="text-sm font-medium text-accent-foreground">Why this bundle?</p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {rec.reasoning}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Included Services:</p>
                      <ul className="space-y-1">
                        {bundle.services.slice(0, 3).map((serviceId) => (
                          <li key={serviceId} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="w-3 h-3 text-accent" />
                            {getServiceName(serviceId)}
                          </li>
                        ))}
                        {bundle.services.length > 3 && (
                          <li className="text-sm text-muted-foreground ml-5">
                            +{bundle.services.length - 3} more services
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-2xl font-bold font-mono text-accent">
                          {bundle.bundlePrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-accent-foreground">MNEE</span>
                      </div>
                      <div className="text-sm text-muted-foreground line-through">
                        {bundle.originalPrice.toFixed(2)} MNEE
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full gap-2 bg-accent text-accent-foreground hover:brightness-110 shadow-lg"
                      onClick={() => handleBundlePurchase(bundle.id)}
                      disabled={!walletConnected}
                    >
                      <Lightning className="w-4 h-4" />
                      Purchase Bundle
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {!isLoading && !error && recommendedBundles.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Robot className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No recommendations available yet.
              <br />
              Make some purchases to get personalized suggestions!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
