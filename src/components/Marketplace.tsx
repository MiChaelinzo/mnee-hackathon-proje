import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MagnifyingGlass, Tag, ShoppingCart, Star, Lightning, Flask, Info } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import EnhancedServiceStats from './EnhancedServiceStats'
import type { Service, Agent, Transaction } from '@/lib/types'
import { formatMNEE, generateTxHash } from '@/lib/mnee'

interface MarketplaceProps {
  services: Service[]
  agents: Agent[]
  transactions: Transaction[]
  onPurchase: (transaction: Transaction) => void
  walletConnected: boolean
  onTransferMNEE?: (toAddress: string, amount: string, onTxSubmit?: (txHash: string) => void) => Promise<string | null>
  userAddress?: string | null
}

export default function Marketplace({ 
  services, 
  agents, 
  transactions, 
  onPurchase, 
  walletConnected,
  onTransferMNEE,
  userAddress,
}: MarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [isPurchasing, setIsPurchasing] = useState(false)

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter
    return matchesSearch && matchesCategory && service.available
  })

  const handlePurchase = async () => {
    if (!selectedService || !selectedAgent) return

    const agent = agents.find((a) => a.id === selectedAgent)
    if (!agent) return

    if (agent.balance < selectedService.price) {
      toast.error('Insufficient MNEE balance', {
        description: `Agent needs ${formatMNEE(selectedService.price - agent.balance)} more MNEE`,
      })
      return
    }

    if (agent.totalSpent + selectedService.price > agent.spendingLimit) {
      toast.error('Spending limit exceeded', {
        description: 'Increase agent spending limit to continue',
      })
      return
    }

    setIsPurchasing(true)

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      agentId: agent.id,
      agentName: agent.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      amount: selectedService.price,
      timestamp: Date.now(),
      status: 'pending',
      type: 'service',
    }

    if (onTransferMNEE && userAddress) {
      try {
        const txHash = await onTransferMNEE(
          selectedService.providerAddress,
          selectedService.price.toString(),
          (submittedTxHash) => {
            transaction.txHash = submittedTxHash
            transaction.status = 'pending'
          }
        )

        if (txHash) {
          transaction.txHash = txHash
          transaction.status = 'completed'
          
          onPurchase(transaction)
          setSelectedService(null)
          setSelectedAgent('')

          toast.success('Purchase successful!', {
            description: `${agent.name} purchased ${selectedService.name} for ${formatMNEE(selectedService.price)}`,
            action: {
              label: 'View on Etherscan',
              onClick: () => window.open(`https://etherscan.io/tx/${txHash}`, '_blank'),
            },
          })
        } else {
          transaction.status = 'failed'
          toast.error('Purchase failed', {
            description: 'The blockchain transaction was not completed',
          })
        }
      } catch (error) {
        transaction.status = 'failed'
        console.error('Purchase error:', error)
      }
    } else {
      transaction.txHash = generateTxHash()
      transaction.status = 'completed'
      
      onPurchase(transaction)
      setSelectedService(null)
      setSelectedAgent('')

      toast.success('Purchase successful!', {
        description: `${agent.name} purchased ${selectedService.name} for ${formatMNEE(selectedService.price)}`,
      })
    }

    setIsPurchasing(false)
  }

  if (!walletConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <ShoppingCart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground max-w-md">
          Connect your Ethereum wallet to browse services and enable your AI agents to make autonomous purchases
        </p>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Tag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No Services Yet</h3>
        <p className="text-muted-foreground max-w-md">
          Be the first to list an AI service on the marketplace! Click "List Service" to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Alert className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <AlertDescription className="text-sm">
              <span className="font-medium">Payment Methods:</span> This marketplace accepts both{' '}
              <Badge variant="outline" className="border-accent/50 bg-accent/10 text-accent px-1.5 py-0 mx-1">
                <span className="text-xs">ON-CHAIN</span>
              </Badge>
              real MNEE from your connected wallet and{' '}
              <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary px-1.5 py-0 mx-1">
                <Flask className="w-2.5 h-2.5 inline mr-0.5" weight="fill" />
                <span className="text-xs">TEST</span>
              </Badge>
              demo MNEE from the faucet. Agents use their internal balance for purchases.
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <EnhancedServiceStats services={services} transactions={transactions} />
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Data Analysis">Data Analysis</SelectItem>
            <SelectItem value="Content Generation">Content Generation</SelectItem>
            <SelectItem value="API Access">API Access</SelectItem>
            <SelectItem value="Compute Resources">Compute Resources</SelectItem>
            <SelectItem value="Machine Learning">Machine Learning</SelectItem>
            <SelectItem value="Image Processing">Image Processing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="p-6 hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full flex flex-col">
              <div onClick={() => setSelectedService(service)} className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="secondary" className="gap-1">
                    <Tag className="w-3 h-3" />
                    {service.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-muted-foreground">{service.rating}</span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {service.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider</span>
                    <span className="font-medium">{service.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sales</span>
                    <span className="font-medium">{service.sales}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Price</div>
                  <div className="text-2xl font-bold font-mono text-accent">
                    {formatMNEE(service.price)}
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedService(service)}
                  className="gap-2 bg-accent text-accent-foreground hover:brightness-110"
                >
                  <Lightning className="w-4 h-4" />
                  Buy Now
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredServices.length === 0 && services.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No services match your search criteria</p>
        </div>
      )}

      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedService?.name}</DialogTitle>
            <DialogDescription>{selectedService?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Category</span>
                <p className="font-medium mt-1">{selectedService?.category}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Provider</span>
                <p className="font-medium mt-1">{selectedService?.provider}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Price</span>
                <p className="font-mono text-xl font-bold text-accent mt-1">
                  {selectedService && formatMNEE(selectedService.price)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Rating</span>
                <p className="font-medium mt-1 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  {selectedService?.rating}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Agent</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent to make the purchase" />
                </SelectTrigger>
                <SelectContent>
                  {agents.filter(a => a.isActive).map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} ({formatMNEE(agent.balance)} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSelectedService(null)}
              disabled={isPurchasing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={!selectedAgent || isPurchasing}
              className="gap-2 bg-accent text-accent-foreground hover:brightness-110"
            >
              {isPurchasing ? (
                <>Processing...</>
              ) : (
                <>
                  <Lightning className="w-4 h-4" />
                  Purchase with MNEE
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
