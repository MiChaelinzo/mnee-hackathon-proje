import { useState, useEffect } from 'react'
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

  useEffect(() => {
    if (services && services.length === 0) {
      const defaultServices: Service[] = [
        {
          id: crypto.randomUUID(),
          name: 'AI Code Review & Optimization',
          description: 'Autonomous AI-powered code analysis that reviews your codebase for bugs, security vulnerabilities, and performance optimizations. Provides actionable insights and automated refactoring suggestions in real-time.',
          category: 'Machine Learning',
          price: 24.99,
          provider: 'SparkAI Labs',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 127,
          rating: 4.9,
        },
        {
          id: crypto.randomUUID(),
          name: 'Real-Time Market Data Stream',
          description: 'High-frequency financial data API providing real-time cryptocurrency and stock market data with sub-second latency. Perfect for trading bots and portfolio management agents.',
          category: 'API Access',
          price: 49.99,
          provider: 'DataStream Pro',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 93,
          rating: 4.8,
        },
        {
          id: crypto.randomUUID(),
          name: 'Sentiment Analysis Engine',
          description: 'Advanced NLP service for analyzing text sentiment across multiple languages. Processes social media, reviews, and customer feedback to extract emotional tone and intent.',
          category: 'Data Analysis',
          price: 12.50,
          provider: 'NeuralText AI',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 215,
          rating: 4.7,
        },
        {
          id: crypto.randomUUID(),
          name: 'GPU Compute - Basic Tier',
          description: 'Affordable GPU compute hours for model training and inference. Includes 1x NVIDIA A100 equivalent with 40GB memory. Perfect for lightweight ML workloads and experimentation.',
          category: 'Compute Resources',
          price: 5.99,
          provider: 'CloudGPU Network',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 342,
          rating: 4.6,
        },
        {
          id: crypto.randomUUID(),
          name: 'GPU Compute - Pro Tier',
          description: 'Premium GPU compute with 4x NVIDIA H100 GPUs for demanding AI workloads. Optimized for large language models, image generation, and complex simulations.',
          category: 'Compute Resources',
          price: 89.99,
          provider: 'CloudGPU Network',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 56,
          rating: 4.9,
        },
        {
          id: crypto.randomUUID(),
          name: 'Blog Post Generator',
          description: 'AI-powered content creation service that generates SEO-optimized blog posts, articles, and marketing copy. Supports multiple tones and industries with built-in fact-checking.',
          category: 'Content Generation',
          price: 8.99,
          provider: 'ContentForge AI',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 189,
          rating: 4.5,
        },
        {
          id: crypto.randomUUID(),
          name: 'Premium Video Script Writer',
          description: 'Elite AI scriptwriting service for YouTube, TikTok, and professional video content. Includes hook optimization, engagement analysis, and viral potential scoring.',
          category: 'Content Generation',
          price: 34.99,
          provider: 'ContentForge AI',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 78,
          rating: 4.8,
        },
        {
          id: crypto.randomUUID(),
          name: 'Image Background Removal',
          description: 'Lightning-fast AI background removal for product photos, portraits, and e-commerce images. Batch processing supported with transparent PNG output.',
          category: 'Image Processing',
          price: 3.99,
          provider: 'PixelCraft Studio',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 521,
          rating: 4.7,
        },
        {
          id: crypto.randomUUID(),
          name: 'AI Photo Enhancement Suite',
          description: 'Professional-grade image upscaling and enhancement. Increases resolution up to 8x, removes noise, sharpens details, and restores old photographs using advanced neural networks.',
          category: 'Image Processing',
          price: 15.99,
          provider: 'PixelCraft Studio',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 143,
          rating: 4.9,
        },
        {
          id: crypto.randomUUID(),
          name: 'Predictive Analytics Model',
          description: 'Train custom ML models for time-series forecasting, demand prediction, and trend analysis. Automated feature engineering and hyperparameter tuning included.',
          category: 'Machine Learning',
          price: 67.50,
          provider: 'Quantum Insights',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 41,
          rating: 4.8,
        },
        {
          id: crypto.randomUUID(),
          name: 'Voice Synthesis - Starter',
          description: 'Text-to-speech API with natural-sounding voices in 30+ languages. Perfect for chatbots, virtual assistants, and accessibility applications. 50,000 characters included.',
          category: 'Content Generation',
          price: 6.99,
          provider: 'VoiceGen AI',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 267,
          rating: 4.6,
        },
        {
          id: crypto.randomUUID(),
          name: 'Web Scraping & Data Mining',
          description: 'Automated web data extraction service with smart pagination, CAPTCHA solving, and anti-bot detection. Delivers structured JSON/CSV output from any website.',
          category: 'Data Analysis',
          price: 19.99,
          provider: 'DataHarvest Pro',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 156,
          rating: 4.7,
        },
        {
          id: crypto.randomUUID(),
          name: 'Blockchain Transaction Monitor',
          description: 'Real-time Ethereum blockchain monitoring with customizable alerts. Track wallet activities, smart contract events, and gas price predictions for optimal transaction timing.',
          category: 'API Access',
          price: 29.99,
          provider: 'ChainWatch Labs',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 84,
          rating: 4.9,
        },
        {
          id: crypto.randomUUID(),
          name: 'Document OCR & Extraction',
          description: 'Advanced optical character recognition for invoices, receipts, contracts, and forms. Extracts structured data with 99.2% accuracy across 100+ document types.',
          category: 'Data Analysis',
          price: 11.99,
          provider: 'DocuScan AI',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 198,
          rating: 4.8,
        },
        {
          id: crypto.randomUUID(),
          name: 'Custom AI Model Training',
          description: 'Enterprise-grade custom model training service. Our team helps fine-tune foundation models on your data with full deployment support and performance guarantees.',
          category: 'Machine Learning',
          price: 499.99,
          provider: 'AI Solutions Enterprise',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 12,
          rating: 5.0,
        },
      ]
      setServices(defaultServices)
    }
  }, [])

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
