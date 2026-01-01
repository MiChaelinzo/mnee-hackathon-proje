import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Scales, 
  Plus, 
  X, 
  CheckCircle, 
  XCircle,
  CurrencyDollar,
  Star,
  TrendUp,
  ShoppingCart,
  Sparkle,
  Crown
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { Service, ServiceBundle, Subscription } from '@/lib/types'

interface ServiceComparisonProps {
  services: Service[]
  bundles: ServiceBundle[]
  subscriptions: Subscription[]
}

interface ComparisonItem {
  id: string
  name: string
  type: 'service' | 'bundle' | 'subscription'
  price: number
  provider: string
  rating: number
  category: string
  sales: number
  description: string
  features?: string[]
}

export default function ServiceComparison({ services, bundles, subscriptions }: ServiceComparisonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<ComparisonItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'service' | 'bundle' | 'subscription'>('all')

  const allItems: ComparisonItem[] = [
    ...services.map(s => ({
      id: s.id,
      name: s.name,
      type: 'service' as const,
      price: s.price,
      provider: s.provider,
      rating: s.rating,
      category: s.category,
      sales: s.sales,
      description: s.description,
    })),
    ...bundles.map(b => ({
      id: b.id,
      name: b.name,
      type: 'bundle' as const,
      price: b.bundlePrice,
      provider: b.provider,
      rating: b.rating,
      category: b.category,
      sales: b.sales,
      description: b.description,
    })),
    ...subscriptions.map(s => ({
      id: s.id,
      name: s.name,
      type: 'subscription' as const,
      price: s.monthlyPrice,
      provider: s.provider,
      rating: s.rating,
      category: s.category,
      sales: s.subscribers,
      description: s.description,
      features: s.features
    }))
  ]

  const filteredItems = allItems.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch && !selectedItems.find(s => s.id === item.id)
  })

  const addToComparison = (item: ComparisonItem) => {
    if (selectedItems.length >= 4) {
      toast.error('Maximum 4 items can be compared')
      return
    }
    setSelectedItems([...selectedItems, item])
    toast.success(`Added ${item.name} to comparison`)
  }

  const removeFromComparison = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id))
    toast.info('Removed from comparison')
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'service': return 'bg-blue-500/10 text-blue-500'
      case 'bundle': return 'bg-purple-500/10 text-purple-500'
      case 'subscription': return 'bg-green-500/10 text-green-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service': return <Sparkle className="w-3 h-3" />
      case 'bundle': return <ShoppingCart className="w-3 h-3" />
      case 'subscription': return <TrendUp className="w-3 h-3" />
      default: return null
    }
  }

  const getBestValue = () => {
    if (selectedItems.length === 0) return null
    const lowestPrice = Math.min(...selectedItems.map(item => item.price))
    const highestRating = Math.max(...selectedItems.map(item => item.rating))
    
    const valueScores = selectedItems.map(item => ({
      id: item.id,
      score: (item.rating / 5) * 0.6 + ((lowestPrice / item.price) * 0.4)
    }))
    
    return valueScores.reduce((best, current) => 
      current.score > best.score ? current : best
    ).id
  }

  const bestValueId = getBestValue()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Scales className="w-4 h-4" />
          Compare Services
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Scales className="w-5 h-5 text-primary" />
            Service Comparison Tool
          </DialogTitle>
          <DialogDescription>
            Compare up to 4 services, bundles, or subscriptions side-by-side
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Search services, bundles, subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="service">Services</SelectItem>
                <SelectItem value="bundle">Bundles</SelectItem>
                <SelectItem value="subscription">Subscriptions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedItems.map(item => (
                <Badge
                  key={item.id}
                  variant="outline"
                  className="gap-2 py-1.5 pl-3 pr-2"
                >
                  {item.name}
                  <button
                    onClick={() => removeFromComparison(item.id)}
                    className="hover:bg-destructive/20 rounded-sm p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className="flex-1 overflow-hidden">
          {selectedItems.length === 0 ? (
            <div className="h-full flex flex-col">
              <div className="px-6 py-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Available items ({filteredItems.length})
                </p>
              </div>
              <ScrollArea className="flex-1 px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
                  {filteredItems.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className={`gap-1 ${getTypeColor(item.type)}`}>
                          {getTypeIcon(item.type)}
                          {item.type}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addToComparison(item)}
                          className="h-7 gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </Button>
                      </div>
                      <h4 className="font-semibold text-sm mb-1 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{item.provider}</p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          <span>{item.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold">
                          <CurrencyDollar className="w-3 h-3" />
                          {item.price}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="px-6 py-4">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedItems.length}, minmax(250px, 1fr))` }}>
                  {selectedItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative rounded-lg border-2 p-5 ${
                        item.id === bestValueId 
                          ? 'border-accent bg-accent/5' 
                          : 'border-border bg-card'
                      }`}
                    >
                      {item.id === bestValueId && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="gap-1 bg-accent text-accent-foreground">
                            <Crown className="w-3 h-3" />
                            Best Value
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className={`gap-1 ${getTypeColor(item.type)}`}>
                          {getTypeIcon(item.type)}
                          {item.type}
                        </Badge>
                        <button
                          onClick={() => removeFromComparison(item.id)}
                          className="hover:bg-destructive/20 rounded-sm p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{item.provider}</p>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Price</span>
                          <div className="flex items-center gap-1 font-bold text-lg">
                            <CurrencyDollar className="w-4 h-4" />
                            {item.price}
                            <span className="text-xs font-normal text-muted-foreground">
                              {item.type === 'subscription' ? '/mo' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Rating</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span className="font-semibold">{item.rating}</span>
                            <span className="text-xs text-muted-foreground">/ 5</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {item.type === 'subscription' ? 'Subscribers' : 'Sales'}
                          </span>
                          <span className="font-semibold">{item.sales}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Category</span>
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Description</p>
                        <p className="text-sm leading-relaxed">{item.description}</p>
                      </div>

                      {item.features && item.features.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Features</p>
                            <div className="space-y-1.5">
                              {item.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <Button className="w-full mt-4 gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Select
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
