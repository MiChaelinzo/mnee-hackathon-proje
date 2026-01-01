import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Storefront, Robot, ListChecks, Plus } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import Header from './components/Header'
import Marketplace from './components/Marketplace'
import AgentDashboard from './components/AgentDashboard'
import TransactionExplorer from './components/TransactionExplorer'
import AddServiceDialog from './components/AddServiceDialog'
import type { Service, Agent, Transaction } from './lib/types'

function App() {
  const [services, setServices] = useKV<Service[]>('services', [])
  const [agents, setAgents] = useKV<Agent[]>('agents', [])
  const [transactions, setTransactions] = useKV<Transaction[]>('transactions', [])
  const [activeTab, setActiveTab] = useState('marketplace')
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)

  const handleAddService = (service: Service) => {
    setServices((current = []) => [...current, service])
  }

  const handlePurchase = (transaction: Transaction) => {
    setTransactions((current = []) => [transaction, ...current])
    
    setAgents((currentAgents = []) =>
      currentAgents.map((agent) =>
        agent.id === transaction.agentId
          ? {
              ...agent,
              balance: agent.balance - transaction.amount,
              totalSpent: agent.totalSpent + transaction.amount,
              purchaseCount: agent.purchaseCount + 1,
            }
          : agent
      )
    )

    setServices((currentServices = []) =>
      currentServices.map((service) =>
        service.id === transaction.serviceId
          ? { ...service, sales: service.sales + 1 }
          : service
      )
    )
  }

  const handleUpdateAgent = (updatedAgent: Agent) => {
    setAgents((current = []) =>
      current.map((agent) => (agent.id === updatedAgent.id ? updatedAgent : agent))
    )
  }

  const handleAddAgent = (agent: Agent) => {
    setAgents((current = []) => [...current, agent])
  }

  return (
    <div className="min-h-screen bg-background text-foreground grid-pattern">
      <Toaster />
      
      <Header 
        walletConnected={walletConnected}
        onWalletToggle={() => setWalletConnected(!walletConnected)}
      />

      <main className="container mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
              AI Agent Marketplace
            </h1>
            <p className="text-lg text-muted-foreground">
              Autonomous commerce powered by MNEE stablecoin
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-grid">
                <TabsTrigger value="marketplace" className="gap-2">
                  <Storefront className="w-4 h-4" />
                  <span className="hidden sm:inline">Marketplace</span>
                </TabsTrigger>
                <TabsTrigger value="agents" className="gap-2">
                  <Robot className="w-4 h-4" />
                  <span className="hidden sm:inline">My Agents</span>
                </TabsTrigger>
                <TabsTrigger value="transactions" className="gap-2">
                  <ListChecks className="w-4 h-4" />
                  <span className="hidden sm:inline">Transactions</span>
                </TabsTrigger>
              </TabsList>

              {activeTab === 'marketplace' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setIsAddServiceOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:brightness-110 transition-all hover:shadow-lg hover:shadow-primary/20"
                >
                  <Plus className="w-5 h-5" />
                  List Service
                </motion.button>
              )}
            </div>

            <TabsContent value="marketplace" className="mt-6">
              <Marketplace
                services={services || []}
                agents={agents || []}
                onPurchase={handlePurchase}
                walletConnected={walletConnected}
              />
            </TabsContent>

            <TabsContent value="agents" className="mt-6">
              <AgentDashboard
                agents={agents || []}
                transactions={transactions || []}
                onUpdateAgent={handleUpdateAgent}
                onAddAgent={handleAddAgent}
              />
            </TabsContent>

            <TabsContent value="transactions" className="mt-6">
              <TransactionExplorer transactions={transactions || []} agents={agents || []} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <AddServiceDialog
        open={isAddServiceOpen}
        onOpenChange={setIsAddServiceOpen}
        onAddService={handleAddService}
      />
    </div>
  )
}

export default App
