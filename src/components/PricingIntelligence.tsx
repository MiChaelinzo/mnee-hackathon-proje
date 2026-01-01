import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkle, 
  TrendUp, 
  TrendDown,
  CurrencyDollar,
  ChartLine,
  Warning,
  CheckCircle,
  Lightbulb,
  Target
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { Service, ServiceCategory } from '@/lib/types'

interface PricingIntelligenceProps {
  services: Service[]
}

interface PricingAnalysis {
  suggestedPrice: number
  confidence: number
  marketPosition: 'budget' | 'competitive' | 'premium'
  insights: string[]
  demandForecast: 'low' | 'medium' | 'high'
  competitorRange: { min: number; max: number; avg: number }
  reasoning: string
}

export default function PricingIntelligence({ services }: PricingIntelligenceProps) {
  const [serviceName, setServiceName] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('Machine Learning')
  const [currentPrice, setCurrentPrice] = useState('')
  const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeWithAI = async () => {
    if (!serviceName || !serviceDescription || !currentPrice) {
      toast.error('Please fill in all fields')
      return
    }

    setIsAnalyzing(true)

    try {
      const categoryServices = services.filter(s => s.category === selectedCategory)
      const avgPrice = categoryServices.reduce((sum, s) => sum + s.price, 0) / categoryServices.length
      const minPrice = Math.min(...categoryServices.map(s => s.price))
      const maxPrice = Math.max(...categoryServices.map(s => s.price))

      const prompt = window.spark.llmPrompt`You are a pricing intelligence AI for an AI agent marketplace. Analyze the following service and provide pricing recommendations.

Service Name: ${serviceName}
Description: ${serviceDescription}
Category: ${selectedCategory}
Current Suggested Price: $${currentPrice}

Market Context:
- Category Average Price: $${avgPrice.toFixed(2)}
- Category Price Range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}
- Similar Services: ${categoryServices.slice(0, 5).map(s => `${s.name} ($${s.price}, ${s.sales} sales, ${s.rating}★)`).join('; ')}

Provide a JSON response with this exact structure:
{
  "suggestedPrice": <number>,
  "confidence": <number between 0-100>,
  "marketPosition": "<budget|competitive|premium>",
  "insights": ["<insight1>", "<insight2>", "<insight3>"],
  "demandForecast": "<low|medium|high>",
  "reasoning": "<detailed explanation>"
}

Consider factors like:
1. Market positioning relative to competitors
2. Service uniqueness and value proposition
3. Category demand trends
4. Price elasticity
5. Optimal profit margins`

      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const result = JSON.parse(response)

      setAnalysis({
        suggestedPrice: result.suggestedPrice,
        confidence: result.confidence,
        marketPosition: result.marketPosition,
        insights: result.insights,
        demandForecast: result.demandForecast,
        competitorRange: {
          min: minPrice,
          max: maxPrice,
          avg: avgPrice
        },
        reasoning: result.reasoning
      })

      toast.success('Pricing analysis complete!')
    } catch (error) {
      console.error('Pricing analysis error:', error)
      toast.error('Failed to analyze pricing. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getPriceDifference = () => {
    if (!analysis || !currentPrice) return 0
    return ((analysis.suggestedPrice - parseFloat(currentPrice)) / parseFloat(currentPrice)) * 100
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'budget': return 'bg-blue-500/10 text-blue-500'
      case 'competitive': return 'bg-green-500/10 text-green-500'
      case 'premium': return 'bg-purple-500/10 text-purple-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'low': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'high': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-primary" />
            AI Pricing Intelligence
          </CardTitle>
          <CardDescription>
            Get AI-powered pricing recommendations based on market data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Service Name</Label>
            <Input
              placeholder="e.g., Advanced Image Processing API"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Service Description</Label>
            <Textarea
              placeholder="Describe your service, its features, and unique value proposition..."
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={selectedCategory} onValueChange={(v: ServiceCategory) => setSelectedCategory(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                <SelectItem value="Content Generation">Content Generation</SelectItem>
                <SelectItem value="API Access">API Access</SelectItem>
                <SelectItem value="Compute Resources">Compute Resources</SelectItem>
                <SelectItem value="Image Processing">Image Processing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Current/Target Price (MNEE)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
            />
          </div>

          <Button
            onClick={analyzeWithAI}
            disabled={isAnalyzing || !serviceName || !serviceDescription || !currentPrice}
            className="w-full gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Analyzing Market...
              </>
            ) : (
              <>
                <Sparkle className="w-4 h-4" />
                Analyze Pricing
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine className="w-5 h-5 text-accent" />
            Analysis Results
          </CardTitle>
          <CardDescription>
            AI-powered pricing insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!analysis ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No analysis yet</p>
              <p className="text-sm mt-1">Fill in the form and click Analyze Pricing</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-lg bg-accent/10 border-2 border-accent/20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Recommended Price</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-accent">
                        ${analysis.suggestedPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">MNEE</span>
                    </div>
                  </div>
                  <Badge className="gap-1 bg-accent text-accent-foreground">
                    <CheckCircle className="w-3 h-3" />
                    {analysis.confidence}% Confidence
                  </Badge>
                </div>

                {currentPrice && (
                  <div className="flex items-center gap-2 text-sm">
                    {getPriceDifference() > 0 ? (
                      <>
                        <TrendUp className="w-4 h-4 text-green-500" />
                        <span className="text-green-500 font-medium">
                          +${(analysis.suggestedPrice - parseFloat(currentPrice)).toFixed(2)} 
                          ({getPriceDifference().toFixed(1)}%) higher
                        </span>
                      </>
                    ) : getPriceDifference() < 0 ? (
                      <>
                        <TrendDown className="w-4 h-4 text-red-500" />
                        <span className="text-red-500 font-medium">
                          -${(parseFloat(currentPrice) - analysis.suggestedPrice).toFixed(2)} 
                          ({Math.abs(getPriceDifference()).toFixed(1)}%) lower
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Price matches suggestion</span>
                    )}
                  </div>
                )}

                <Progress value={analysis.confidence} className="mt-3 h-2" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Market Position</p>
                  <Badge variant="outline" className={`${getPositionColor(analysis.marketPosition)} capitalize`}>
                    {analysis.marketPosition}
                  </Badge>
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Demand Forecast</p>
                  <span className={`font-semibold capitalize ${getDemandColor(analysis.demandForecast)}`}>
                    {analysis.demandForecast}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CurrencyDollar className="w-4 h-4" />
                  Competitor Price Range
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Minimum</span>
                    <span className="font-semibold">${analysis.competitorRange.min.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Average</span>
                    <span className="font-semibold">${analysis.competitorRange.avg.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Maximum</span>
                    <span className="font-semibold">${analysis.competitorRange.max.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Key Insights
                </p>
                <div className="space-y-2">
                  {analysis.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm p-3 rounded-lg bg-muted/50">
                      <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-semibold mb-2">Detailed Reasoning</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {analysis.reasoning}
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
