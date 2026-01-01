import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, Lightning, Tag, Check, CalendarBlank, Percent, TrendUp } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { ServiceBundle, Subscription, Agent, Transaction, Service } from '@/lib/types'

interface BundlesViewProps {
  bundles: ServiceBundle[]
  subscriptions: Subscription[]
  services: Service[]
  agents: Agent[]
  onPurchase: (transaction: Transaction) => void
  walletConnected: boolean
}

export default function BundlesView({
  bundles,
  subscriptions,
  services,
  agents,
  onPurchase,
  walletConnected,
}: BundlesViewProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>(agents[0]?.id || '')

  const calculateTotalSavings = () => {
    const bundleSavings = bundles.reduce((acc, bundle) => {
      return acc + (bundle.originalPrice - bundle.bundlePrice)
    }, 0)
    const subSavings = subscriptions.reduce((acc, sub) => {
      const fullPrice = sub.monthlyPrice * (sub.billingPeriod === 'yearly' ? 12 : sub.billingPeriod === 'quarterly' ? 3 : 1)
      return acc + (fullPrice - sub.totalPrice)
    }, 0)
    return bundleSavings + subSavings
  }

  const getMaxDiscount = () => {
    const bundleMax = Math.max(...bundles.map(b => b.discount), 0)
    const subMax = Math.max(...subscriptions.map(s => s.discount), 0)
    return Math.max(bundleMax, subMax)
  }

  const handleBundlePurchase = (bundle: ServiceBundle) => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!selectedAgent) {
      toast.error('Please select an agent')
      return
    }

    const agent = agents.find((a) => a.id === selectedAgent)
    if (!agent) return

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
    toast.success(`Bundle purchased! Saved ${bundle.discount}%`)
  }

  const handleSubscriptionPurchase = (subscription: Subscription) => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!selectedAgent) {
      toast.error('Please select an agent')
      return
    }

    const agent = agents.find((a) => a.id === selectedAgent)
    if (!agent) return

    if (agent.balance < subscription.totalPrice) {
      toast.error('Insufficient MNEE balance')
      return
    }

    if (agent.totalSpent + subscription.totalPrice > agent.spendingLimit) {
      toast.error('Purchase exceeds agent spending limit')
      return
    }

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      agentId: agent.id,
      agentName: agent.name,
      serviceId: subscription.id,
      serviceName: subscription.name,
      amount: subscription.totalPrice,
      timestamp: Date.now(),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      type: 'subscription',
      subscriptionId: subscription.id,
    }

    onPurchase(transaction)
    toast.success(`Subscription activated! Saved ${subscription.discount}%`)
  }

  const getServiceName = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.name || 'Service'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Bundles & Subscriptions</h2>
        <p className="text-muted-foreground">
          Save on multiple services with bundled packages and recurring subscriptions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Packages</p>
                <p className="text-3xl font-bold">{bundles.length + subscriptions.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Max Savings</p>
                <p className="text-3xl font-bold">{getMaxDiscount()}%</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Percent className="w-5 h-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-border">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Available Savings</p>
                <p className="text-3xl font-bold font-mono">{calculateTotalSavings().toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">MNEE</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <TrendUp className="w-5 h-5 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {agents.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
          <span className="text-sm font-medium">Purchasing as:</span>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="px-4 py-2 bg-background border rounded-lg text-sm font-mono"
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} ({agent.balance.toFixed(2)} MNEE)
              </option>
            ))}
          </select>
        </div>
      )}

      <Tabs defaultValue="bundles" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-grid">
          <TabsTrigger value="bundles" className="gap-2">
            <Package className="w-4 h-4" />
            Service Bundles
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <CalendarBlank className="w-4 h-4" />
            Subscriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bundles" className="space-y-6">
          {bundles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No bundles available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bundles.map((bundle, index) => (
                <motion.div
                  key={bundle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full flex flex-col hover:shadow-lg hover:shadow-primary/10 transition-all border-border/50">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/30">
                          <Tag className="w-3 h-3 mr-1" />
                          {bundle.category}
                        </Badge>
                        <Badge className="bg-primary/20 text-primary font-mono">
                          Save {bundle.discount}%
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{bundle.name}</CardTitle>
                      <CardDescription>{bundle.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-4">
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
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="line-through">{bundle.originalPrice.toFixed(2)} MNEE</span>
                            {bundle.validityDays && (
                              <>
                                <span>•</span>
                                <span>{bundle.validityDays} days access</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full gap-2 bg-primary hover:brightness-110"
                        onClick={() => handleBundlePurchase(bundle)}
                        disabled={!walletConnected || agents.length === 0}
                      >
                        <Lightning className="w-4 h-4" />
                        Purchase Bundle
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          {subscriptions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarBlank className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No subscriptions available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.map((subscription, index) => (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full flex flex-col hover:shadow-lg hover:shadow-primary/10 transition-all border-border/50">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/30">
                          <Tag className="w-3 h-3 mr-1" />
                          {subscription.category}
                        </Badge>
                        <Badge className="bg-primary/20 text-primary font-mono">
                          Save {subscription.discount}%
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{subscription.name}</CardTitle>
                      <CardDescription>{subscription.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Features:</p>
                          <ul className="space-y-1">
                            {subscription.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="w-3 h-3 text-accent" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-4 border-t">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-2xl font-bold font-mono text-accent">
                              {subscription.totalPrice.toFixed(2)}
                            </span>
                            <span className="text-sm text-accent-foreground">MNEE</span>
                          </div>
                          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                            <span>
                              {subscription.monthlyPrice.toFixed(2)} MNEE/month
                            </span>
                            <span className="capitalize">
                              Billed {subscription.billingPeriod}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full gap-2 bg-primary hover:brightness-110"
                        onClick={() => handleSubscriptionPurchase(subscription)}
                        disabled={!walletConnected || agents.length === 0}
                      >
                        <Lightning className="w-4 h-4" />
                        Subscribe Now
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
