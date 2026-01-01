import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Package, 
  Plus, 
  X, 
  Sparkle, 
  TrendUp, 
  Calendar,
  Check,
  Warning
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { Service, ServiceBundle, ServiceCategory } from '@/lib/types'

interface BundleBuilderProps {
  services: Service[]
  onCreateBundle: (bundle: ServiceBundle) => void
  onClose?: () => void
}

export default function BundleBuilder({ services, onCreateBundle, onClose }: BundleBuilderProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [bundleName, setBundleName] = useState('')
  const [bundleDescription, setBundleDescription] = useState('')
  const [discountPercentage, setDiscountPercentage] = useState(15)
  const [validityDays, setValidityDays] = useState(30)
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const categories: (ServiceCategory | 'All')[] = [
    'All',
    'Machine Learning',
    'API Access',
    'Data Analysis',
    'Content Generation',
    'Compute Resources',
    'Image Processing'
  ]

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [services, selectedCategory, searchQuery])

  const selectedServiceObjects = useMemo(() => {
    return services.filter(s => selectedServices.includes(s.id))
  }, [services, selectedServices])

  const originalPrice = useMemo(() => {
    return selectedServiceObjects.reduce((sum, service) => sum + service.price, 0)
  }, [selectedServiceObjects])

  const bundlePrice = useMemo(() => {
    return originalPrice * (1 - discountPercentage / 100)
  }, [originalPrice, discountPercentage])

  const savings = useMemo(() => {
    return originalPrice - bundlePrice
  }, [originalPrice, bundlePrice])

  const suggestedDiscount = useMemo(() => {
    const count = selectedServices.length
    if (count >= 5) return 25
    if (count >= 3) return 20
    if (count >= 2) return 15
    return 10
  }, [selectedServices.length])

  const dominantCategory = useMemo(() => {
    if (selectedServiceObjects.length === 0) return 'Machine Learning'
    
    const categoryCounts: Record<string, number> = {}
    selectedServiceObjects.forEach(service => {
      categoryCounts[service.category] = (categoryCounts[service.category] || 0) + 1
    })
    
    return Object.entries(categoryCounts).reduce((a, b) => 
      categoryCounts[a[0]] > categoryCounts[b[0]] ? a : b
    )[0] as ServiceCategory
  }, [selectedServiceObjects])

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleCreateBundle = () => {
    if (selectedServices.length < 2) {
      toast.error('Please select at least 2 services for your bundle')
      return
    }

    if (!bundleName.trim()) {
      toast.error('Please provide a bundle name')
      return
    }

    if (!bundleDescription.trim()) {
      toast.error('Please provide a bundle description')
      return
    }

    const newBundle: ServiceBundle = {
      id: crypto.randomUUID(),
      name: bundleName,
      description: bundleDescription,
      services: selectedServices,
      originalPrice,
      bundlePrice,
      discount: discountPercentage,
      category: dominantCategory,
      provider: 'Custom Bundle',
      providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
      available: true,
      sales: 0,
      rating: 0,
      validityDays
    }

    onCreateBundle(newBundle)
    toast.success('Custom bundle created successfully!')
    
    setSelectedServices([])
    setBundleName('')
    setBundleDescription('')
    setDiscountPercentage(15)
    setValidityDays(30)
    
    if (onClose) onClose()
  }

  const applySuggestedDiscount = () => {
    setDiscountPercentage(suggestedDiscount)
    toast.success(`Applied ${suggestedDiscount}% discount`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Select Services
            </CardTitle>
            <CardDescription>
              Choose services to include in your custom bundle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as ServiceCategory | 'All')}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {filteredServices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No services found</p>
                </div>
              ) : (
                filteredServices.map(service => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedServices.includes(service.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    }`}
                    onClick={() => toggleService(service.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{service.name}</h4>
                          <Badge variant="secondary" className="shrink-0 font-mono">
                            {service.price.toFixed(2)} MNEE
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {service.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {service.sales} sales
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkle className="w-5 h-5 text-accent" />
              Bundle Configuration
            </CardTitle>
            <CardDescription>
              {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bundle-name">Bundle Name</Label>
              <Input
                id="bundle-name"
                placeholder="e.g., AI Content Suite"
                value={bundleName}
                onChange={(e) => setBundleName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bundle-description">Description</Label>
              <Textarea
                id="bundle-description"
                placeholder="Describe what this bundle offers..."
                value={bundleDescription}
                onChange={(e) => setBundleDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Discount Percentage</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold">{discountPercentage}%</span>
                  {discountPercentage !== suggestedDiscount && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={applySuggestedDiscount}
                      className="h-6 text-xs gap-1"
                    >
                      <TrendUp className="w-3 h-3" />
                      Suggest {suggestedDiscount}%
                    </Button>
                  )}
                </div>
              </div>
              <Slider
                value={[discountPercentage]}
                onValueChange={(val) => setDiscountPercentage(val[0])}
                min={5}
                max={50}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Higher discounts attract more customers
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Validity Period
                </Label>
                <span className="text-sm font-mono font-semibold">{validityDays} days</span>
              </div>
              <Slider
                value={[validityDays]}
                onValueChange={(val) => setValidityDays(val[0])}
                min={7}
                max={365}
                step={7}
                className="w-full"
              />
            </div>

            <Separator />

            <div className="space-y-3 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Original Price:</span>
                <span className="font-mono">{originalPrice.toFixed(2)} MNEE</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-mono text-destructive">-{savings.toFixed(2)} MNEE</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Bundle Price:</span>
                <span className="text-xl font-bold font-mono text-primary">
                  {bundlePrice.toFixed(2)} MNEE
                </span>
              </div>
              {savings > 0 && (
                <div className="flex items-center gap-2 text-xs text-accent">
                  <Check className="w-4 h-4" />
                  Save {savings.toFixed(2)} MNEE ({discountPercentage}% off)
                </div>
              )}
            </div>

            {selectedServices.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Selected Services:</Label>
                <div className="space-y-1 max-h-[150px] overflow-y-auto">
                  <AnimatePresence>
                    {selectedServiceObjects.map(service => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between gap-2 p-2 rounded bg-background border border-border text-xs"
                      >
                        <span className="truncate flex-1">{service.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-muted-foreground">
                            {service.price.toFixed(2)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleService(service.id)
                            }}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {selectedServices.length < 2 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Warning className="w-4 h-4" />
                Select at least 2 services to create a bundle
              </div>
            )}
            <Button
              onClick={handleCreateBundle}
              disabled={selectedServices.length < 2 || !bundleName.trim() || !bundleDescription.trim()}
              className="w-full gap-2"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Create Bundle
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
