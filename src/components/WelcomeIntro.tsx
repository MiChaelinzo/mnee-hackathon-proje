import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Robot, Storefront, Lightning, ShieldCheck, ChartLine, Sparkle, ArrowRight, Check } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface WelcomeIntroProps {
  onDismiss: () => void
  onConnectWallet: () => void
  isWalletConnected: boolean
}

export default function WelcomeIntro({ onDismiss, onConnectWallet, isWalletConnected }: WelcomeIntroProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenIntro, setHasSeenIntro] = useKV<boolean>('has-seen-intro', false)

  const steps = [
    {
      icon: <Storefront className="w-16 h-16" />,
      title: 'Welcome to the Future of Commerce',
      description: 'The AI Agent Marketplace is a decentralized platform where AI agents can autonomously discover, purchase, and sell services using MNEE stablecoin.',
      features: [
        'Browse hundreds of AI services',
        'Autonomous agent transactions',
        'Real blockchain settlement',
      ]
    },
    {
      icon: <Robot className="w-16 h-16" />,
      title: 'AI Agents Take Control',
      description: 'Create and manage AI agents that can make intelligent purchasing decisions on your behalf, optimizing for cost, quality, and timing.',
      features: [
        'Configure multiple agents',
        'Set spending limits',
        'Monitor performance in real-time',
      ]
    },
    {
      icon: <Lightning className="w-16 h-16" />,
      title: 'Powered by MNEE',
      description: 'All transactions use MNEE stablecoin on Ethereum mainnet, ensuring fast, secure, and transparent payments with full blockchain verification.',
      features: [
        'Instant on-chain transactions',
        'Verifiable on Etherscan',
        'Test mode available',
      ]
    },
    {
      icon: <Sparkle className="w-16 h-16" />,
      title: 'Intelligent Features',
      description: 'Leverage AI-powered recommendations, predictive analytics, smart workflows, and pricing intelligence to maximize value.',
      features: [
        'AI service recommendations',
        'Predictive spending analytics',
        'Custom workflow builder',
      ]
    }
  ]

  const handleGetStarted = () => {
    setHasSeenIntro(true)
    if (!isWalletConnected) {
      onConnectWallet()
    } else {
      onDismiss()
    }
  }

  const handleSkip = () => {
    setHasSeenIntro(true)
    onDismiss()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg flex items-center justify-center p-4"
    >
      <Card className="relative max-w-4xl w-full bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-primary"
                >
                  {steps[currentStep].icon}
                </motion.div>
              </div>

              <div className="text-center space-y-4">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-bold tracking-tight"
                >
                  {steps[currentStep].title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-muted-foreground max-w-2xl mx-auto"
                >
                  {steps[currentStep].description}
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto"
              >
                {steps[currentStep].features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30 border border-border"
                  >
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                {currentStep < steps.length - 1 ? (
                  <>
                    <Button
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      size="lg"
                      className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90"
                    >
                      Next
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={handleSkip}
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Skip Tour
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleGetStarted}
                      size="lg"
                      className="w-full sm:w-auto gap-2 bg-accent text-accent-foreground hover:bg-accent/90 glow-accent"
                    >
                      {isWalletConnected ? 'Start Exploring' : 'Connect Wallet & Start'}
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={handleSkip}
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Skip for Now
                    </Button>
                  </>
                )}
              </div>

              <div className="flex justify-center gap-2 pt-4">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-primary'
                        : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute inset-0 -z-10 overflow-hidden rounded-lg">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/10 to-primary/10 blur-3xl"
          />
        </div>
      </Card>
    </motion.div>
  )
}
