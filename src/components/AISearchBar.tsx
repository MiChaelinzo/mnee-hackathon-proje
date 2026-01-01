import { useState } from 'react'
import { MagnifyingGlass, Sparkle, X } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import type { Service } from '@/lib/types'

interface SearchResult {
  service: Service
  relevanceScore: number
  reasoning: string
}

interface AISearchBarProps {
  services: Service[]
  onSelectService: (service: Service) => void
}

export default function AISearchBar({ services, onSelectService }: AISearchBarProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async () => {
    if (!query.trim() || services.length === 0) return

    setIsSearching(true)
    setShowResults(true)

    try {
      const servicesContext = services.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        price: s.price,
        rating: s.rating,
      }))

      const prompt = window.spark.llmPrompt`You are an AI service discovery assistant for an AI agent marketplace. 

User query: "${query}"

Available services: ${JSON.stringify(servicesContext, null, 2)}

Analyze the user's query and return the TOP 5 most relevant services. Consider:
- Direct keyword matches in name and description
- Semantic similarity to the user's intent
- Category relevance
- Service quality (rating and price)

Return ONLY valid JSON in this exact format:
{
  "results": [
    {
      "serviceId": "service-uuid",
      "relevanceScore": 95,
      "reasoning": "Brief explanation why this service matches the query"
    }
  ]
}

The relevanceScore should be 0-100. Order by relevance (highest first). Return up to 5 results.`

      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const parsed = JSON.parse(response)

      const searchResults: SearchResult[] = parsed.results
        .map((r: any) => {
          const service = services.find(s => s.id === r.serviceId)
          if (!service) return null
          return {
            service,
            relevanceScore: r.relevanceScore,
            reasoning: r.reasoning,
          }
        })
        .filter(Boolean)

      setResults(searchResults)
    } catch (error) {
      console.error('AI search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div className="relative w-full max-w-3xl">
      <div className="relative">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask AI: 'I need tools for analyzing customer sentiment from social media...'"
          className="pl-12 pr-28 h-14 text-base bg-card border-2 border-border focus:border-primary transition-colors"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="gap-2 h-10"
          >
            {isSearching ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkle className="w-4 h-4" />
                </motion.div>
                Analyzing
              </>
            ) : (
              <>
                <Sparkle className="w-4 h-4" />
                AI Search
              </>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full z-50"
          >
            <Card className="p-4 max-h-[600px] overflow-y-auto border-2 border-primary/20 shadow-xl bg-card">
              {results.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">AI Search Results</h3>
                    <Button variant="ghost" size="sm" onClick={clearSearch}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {results.map((result, index) => (
                    <motion.div
                      key={result.service.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className="p-4 hover:border-primary/50 transition-all cursor-pointer group"
                        onClick={() => {
                          onSelectService(result.service)
                          setShowResults(false)
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="secondary"
                                className="bg-gradient-to-r from-primary/20 to-accent/20 font-mono text-xs"
                              >
                                {result.relevanceScore}% Match
                              </Badge>
                              <Badge variant="outline">{result.service.category}</Badge>
                            </div>
                            <h4 className="font-semibold text-base group-hover:text-primary transition-colors">
                              {result.service.name}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {result.service.description}
                            </p>
                            <div className="flex items-center gap-2 pt-2">
                              <Sparkle className="w-4 h-4 text-primary" />
                              <p className="text-xs text-muted-foreground italic">
                                {result.reasoning}
                              </p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="text-lg font-bold font-mono text-accent">
                              {result.service.price} MNEE
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ★ {result.service.rating}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {isSearching ? (
                    <div className="flex flex-col items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkle className="w-8 h-8 text-primary" />
                      </motion.div>
                      <p>AI analyzing your request...</p>
                    </div>
                  ) : (
                    <p>No results found. Try rephrasing your query.</p>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
