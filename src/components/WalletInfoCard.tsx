import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, CheckCircle, Warning, Info } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { MNEE_CONTRACT_ADDRESS, formatAddress } from '@/lib/mnee'

interface WalletInfoCardProps {
  walletConnected: boolean
  onWalletToggle: () => void
}

export default function WalletInfoCard({ walletConnected, onWalletToggle }: WalletInfoCardProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    setTimeout(() => {
      onWalletToggle()
      setIsConnecting(false)
    }, 800)
  }

  if (!walletConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" weight="bold" />
              </div>
              <div>
                <CardTitle className="text-xl">Connect Wallet</CardTitle>
                <CardDescription>Enable your AI agents to transact</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
              <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Connect your Ethereum wallet to access the marketplace and enable autonomous AI agent purchases using MNEE stablecoin.
              </p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" weight="fill" />
                <span>Secure on-chain transactions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" weight="fill" />
                <span>USD-backed MNEE stablecoin</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" weight="fill" />
                <span>Full transaction transparency</span>
              </div>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full gap-2 bg-primary hover:brightness-110 text-lg py-6"
            >
              <Wallet className="w-5 h-5" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-accent" weight="fill" />
              </div>
              <div>
                <CardTitle className="text-lg">Wallet Connected</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                    <CheckCircle className="w-3 h-3 mr-1" weight="fill" />
                    Active
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={onWalletToggle}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              Disconnect
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm text-muted-foreground">MNEE Contract</span>
            <code className="text-xs font-mono bg-background px-2 py-1 rounded">
              {formatAddress(MNEE_CONTRACT_ADDRESS)}
            </code>
          </div>
          <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
            <CheckCircle className="w-5 h-5 text-accent shrink-0" weight="fill" />
            <p className="text-sm text-accent-foreground">
              Your agents can now make autonomous purchases
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
