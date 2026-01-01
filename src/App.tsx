import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { useWallet } from './hooks/use-wallet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Storefront, Robot, ListChecks, Plus, Package } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import Header from './components/Header'
import Marketplace from './components/Marketplace'
import AgentDashboard from './components/AgentDashboard'
import TransactionExplorer from './components/TransactionExplorer'
import AddServiceDialog from './components/AddServiceDialog'
import BundlesView from './components/BundlesView'
import type { Service, Agent, Transaction, ServiceBundle, Subscription } from './lib/types'

function App() {
  const wallet = useWallet()
  const [services, setServices] = useKV<Service[]>('services', [])
  const [agents, setAgents] = useKV<Agent[]>('agents', [])
  const [transactions, setTransactions] = useKV<Transaction[]>('transactions', [])
  const [bundles, setBundles] = useKV<ServiceBundle[]>('bundles', [])
  const [subscriptions, setSubscriptions] = useKV<Subscription[]>('subscriptions', [])
  const [activeTab, setActiveTab] = useState('marketplace')
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)

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

    if (bundles && bundles.length === 0 && services && services.length > 0) {
      const defaultBundles: ServiceBundle[] = [
        {
          id: crypto.randomUUID(),
          name: 'Content Creator Pro Bundle',
          description: 'Complete content generation suite for AI agents producing blogs, videos, and social media content',
          services: [
            services.find(s => s.name === 'Blog Post Generator')?.id || '',
            services.find(s => s.name === 'Premium Video Script Writer')?.id || '',
            services.find(s => s.name === 'Voice Synthesis - Starter')?.id || '',
          ].filter(Boolean),
          originalPrice: 50.97,
          bundlePrice: 39.99,
          discount: 21,
          category: 'Content Generation',
          provider: 'ContentForge AI',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 45,
          rating: 4.8,
          validityDays: 30,
        },
        {
          id: crypto.randomUUID(),
          name: 'Data Intelligence Bundle',
          description: 'Comprehensive data analysis toolkit for AI agents processing and extracting insights from multiple sources',
          services: [
            services.find(s => s.name === 'Sentiment Analysis Engine')?.id || '',
            services.find(s => s.name === 'Web Scraping & Data Mining')?.id || '',
            services.find(s => s.name === 'Document OCR & Extraction')?.id || '',
          ].filter(Boolean),
          originalPrice: 44.48,
          bundlePrice: 34.99,
          discount: 21,
          category: 'Data Analysis',
          provider: 'DataHarvest Pro',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 38,
          rating: 4.7,
          validityDays: 30,
        },
        {
          id: crypto.randomUUID(),
          name: 'Visual AI Bundle',
          description: 'Essential image processing services for AI agents working with visual content',
          services: [
            services.find(s => s.name === 'Image Background Removal')?.id || '',
            services.find(s => s.name === 'AI Photo Enhancement Suite')?.id || '',
          ].filter(Boolean),
          originalPrice: 19.98,
          bundlePrice: 14.99,
          discount: 25,
          category: 'Image Processing',
          provider: 'PixelCraft Studio',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 89,
          rating: 4.9,
          validityDays: 30,
        },
        {
          id: crypto.randomUUID(),
          name: 'ML Developer Bundle',
          description: 'Complete machine learning toolset with compute resources and advanced models',
          services: [
            services.find(s => s.name === 'GPU Compute - Pro Tier')?.id || '',
            services.find(s => s.name === 'Predictive Analytics Model')?.id || '',
            services.find(s => s.name === 'AI Code Review & Optimization')?.id || '',
          ].filter(Boolean),
          originalPrice: 182.48,
          bundlePrice: 139.99,
          discount: 23,
          category: 'Machine Learning',
          provider: 'AI Solutions Enterprise',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 23,
          rating: 4.9,
          validityDays: 30,
        },
        {
          id: crypto.randomUUID(),
          name: 'Trading Bot Essentials',
          description: 'Real-time data and monitoring services for automated trading agents',
          services: [
            services.find(s => s.name === 'Real-Time Market Data Stream')?.id || '',
            services.find(s => s.name === 'Blockchain Transaction Monitor')?.id || '',
          ].filter(Boolean),
          originalPrice: 79.98,
          bundlePrice: 59.99,
          discount: 25,
          category: 'API Access',
          provider: 'DataStream Pro',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          sales: 67,
          rating: 4.8,
          validityDays: 30,
        },
      ]
      setBundles(defaultBundles)
    }

    if (subscriptions && subscriptions.length === 0 && services && services.length > 0) {
      const defaultSubscriptions: Subscription[] = [
        {
          id: crypto.randomUUID(),
          name: 'Startup Agent Plan',
          description: 'Perfect for individual AI agents or small-scale automation projects',
          services: [
            services.find(s => s.name === 'GPU Compute - Basic Tier')?.id || '',
            services.find(s => s.name === 'Sentiment Analysis Engine')?.id || '',
            services.find(s => s.name === 'Blog Post Generator')?.id || '',
          ].filter(Boolean),
          monthlyPrice: 22.99,
          billingPeriod: 'monthly',
          totalPrice: 22.99,
          discount: 15,
          category: 'Content Generation',
          provider: 'AI Solutions Enterprise',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          subscribers: 156,
          rating: 4.7,
          features: [
            'GPU Compute - Basic Tier access',
            'Sentiment Analysis Engine',
            'Blog Post Generator',
            'Priority support',
            'Monthly usage reports',
          ],
        },
        {
          id: crypto.randomUUID(),
          name: 'Professional Agent Plan',
          description: 'Comprehensive services for production AI agents with high-volume needs',
          services: [
            services.find(s => s.name === 'GPU Compute - Pro Tier')?.id || '',
            services.find(s => s.name === 'Real-Time Market Data Stream')?.id || '',
            services.find(s => s.name === 'Web Scraping & Data Mining')?.id || '',
            services.find(s => s.name === 'AI Photo Enhancement Suite')?.id || '',
          ].filter(Boolean),
          monthlyPrice: 119.99,
          billingPeriod: 'monthly',
          totalPrice: 119.99,
          discount: 25,
          category: 'Machine Learning',
          provider: 'AI Solutions Enterprise',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          subscribers: 78,
          rating: 4.9,
          features: [
            'GPU Compute - Pro Tier unlimited',
            'Real-Time Market Data Stream',
            'Web Scraping & Data Mining',
            'AI Photo Enhancement Suite',
            '24/7 priority support',
            'Custom integrations available',
            'Advanced analytics dashboard',
          ],
        },
        {
          id: crypto.randomUUID(),
          name: 'Enterprise Agent Plan - Quarterly',
          description: 'Maximum value for enterprise-scale AI operations with quarterly commitment',
          services: services.slice(0, 8).map(s => s.id),
          monthlyPrice: 249.99,
          billingPeriod: 'quarterly',
          totalPrice: 674.97,
          discount: 35,
          category: 'Machine Learning',
          provider: 'AI Solutions Enterprise',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          subscribers: 34,
          rating: 5.0,
          features: [
            'Access to all premium services',
            'Unlimited GPU compute hours',
            'Dedicated account manager',
            'Custom model training included',
            'White-label options',
            'SLA guarantees',
            'Quarterly strategy sessions',
            'Early access to new features',
          ],
        },
        {
          id: crypto.randomUUID(),
          name: 'Content Creator Pro - Annual',
          description: 'Year-long content generation suite with maximum savings for committed creators',
          services: [
            services.find(s => s.name === 'Blog Post Generator')?.id || '',
            services.find(s => s.name === 'Premium Video Script Writer')?.id || '',
            services.find(s => s.name === 'Voice Synthesis - Starter')?.id || '',
            services.find(s => s.name === 'Image Background Removal')?.id || '',
          ].filter(Boolean),
          monthlyPrice: 39.99,
          billingPeriod: 'yearly',
          totalPrice: 383.90,
          discount: 40,
          category: 'Content Generation',
          provider: 'ContentForge AI',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          subscribers: 112,
          rating: 4.8,
          features: [
            'Unlimited blog post generation',
            'Premium video scripts',
            'Voice synthesis (500K chars/month)',
            'Background removal (10K images/month)',
            'Content calendar planning',
            'SEO optimization tools',
            'Trend analysis reports',
          ],
        },
        {
          id: crypto.randomUUID(),
          name: 'Data Analysis Pro - Monthly',
          description: 'Complete data processing and analysis suite for data-driven AI agents',
          services: [
            services.find(s => s.name === 'Sentiment Analysis Engine')?.id || '',
            services.find(s => s.name === 'Web Scraping & Data Mining')?.id || '',
            services.find(s => s.name === 'Document OCR & Extraction')?.id || '',
            services.find(s => s.name === 'Predictive Analytics Model')?.id || '',
          ].filter(Boolean),
          monthlyPrice: 89.99,
          billingPeriod: 'monthly',
          totalPrice: 89.99,
          discount: 20,
          category: 'Data Analysis',
          provider: 'DataHarvest Pro',
          providerAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
          available: true,
          subscribers: 91,
          rating: 4.8,
          features: [
            'Multi-language sentiment analysis',
            'Unlimited web scraping',
            'OCR for all document types',
            'Custom ML model training',
            'Data visualization tools',
            'API access included',
          ],
        },
      ]
      setSubscriptions(defaultSubscriptions)
    }
  }, [services])

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

  const handleCreateBundle = (bundle: ServiceBundle) => {
    setBundles((current = []) => [...current, bundle])
  }

  return (
    <div className="min-h-screen bg-background text-foreground grid-pattern">
      <Toaster />
      
      <Header 
        address={wallet.address}
        chainId={wallet.chainId}
        isConnected={wallet.isConnected}
        isConnecting={wallet.isConnecting}
        mneeBalance={wallet.mneeBalance}
        ethBalance={wallet.ethBalance}
        onConnect={wallet.connectWallet}
        onDisconnect={wallet.disconnectWallet}
        onSwitchNetwork={wallet.switchToEthereumMainnet}
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
              <TabsList className="w-full md:w-auto grid grid-cols-4 md:inline-grid">
                <TabsTrigger value="marketplace" className="gap-2">
                  <Storefront className="w-4 h-4" />
                  <span className="hidden sm:inline">Marketplace</span>
                </TabsTrigger>
                <TabsTrigger value="bundles" className="gap-2">
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Bundles</span>
                </TabsTrigger>
                <TabsTrigger value="agents" className="gap-2">
                  <Robot className="w-4 h-4" />
                  <span className="hidden sm:inline">Agents</span>
                </TabsTrigger>
                <TabsTrigger value="transactions" className="gap-2">
                  <ListChecks className="w-4 h-4" />
                  <span className="hidden sm:inline">Activity</span>
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
                transactions={transactions || []}
                onPurchase={handlePurchase}
                walletConnected={wallet.isConnected}
              />
            </TabsContent>

            <TabsContent value="bundles" className="mt-6">
              <BundlesView
                bundles={bundles || []}
                subscriptions={subscriptions || []}
                services={services || []}
                agents={agents || []}
                transactions={transactions || []}
                onPurchase={handlePurchase}
                onCreateBundle={handleCreateBundle}
                walletConnected={wallet.isConnected}
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
