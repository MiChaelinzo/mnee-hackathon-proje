import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, CheckCircle, Warning, Info, Flask } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { MNEE_CONTRACT_ADDRESS, formatAddress } from '@/lib/mnee'
import { Separator } from '@/components/ui/separator'

interface WalletInfoCardProps {
  address: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  mneeBalance: string
  testMneeBalance: number
  ethBalance: string
  onConnect: () => void
  onDisconnect: () => void
  onSwitchNetwork: () => void
}

export default function WalletInfoCard({ 
  address,
  chainId,
  isConnected, 
  isConnecting,
  mneeBalance,
  testMneeBalance,
  ethBalance,
  onConnect, 
  onDisconnect,
  onSwitchNetwork
}: WalletInfoCardProps) {
  const isWrongNetwork = isConnected && chainId !== 1
  const hasTestMnee = testMneeBalance > 0
  const hasOnChainMnee = parseFloat(mneeBalance) > 0
  const totalMnee = parseFloat(mneeBalance) + testMneeBalance

  if (!isConnected) {
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
                Connect your MetaMask wallet to access the marketplace and enable autonomous AI agent purchases using MNEE stablecoin on Ethereum Mainnet.
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
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" weight="fill" />
                <span>Real-time balance updates</span>
              </div>
            </div>

            {!window.ethereum && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                <Warning className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive mb-1">MetaMask Not Detected</p>
                  <p className="text-muted-foreground">
                    Please install{' '}
                    <a 
                      href="https://metamask.io/download/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      MetaMask browser extension
                    </a>
                    {' '}to continue.
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={onConnect}
              disabled={isConnecting || !window.ethereum}
              className="w-full gap-2 bg-primary hover:brightness-110 text-lg py-6"
            >
              <Wallet className="w-5 h-5" />
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
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
      <Card className={`${isWrongNetwork ? 'border-destructive/30 bg-gradient-to-br from-destructive/5 to-transparent' : 'border-accent/30 bg-gradient-to-br from-accent/5 to-transparent'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${isWrongNetwork ? 'bg-destructive/10' : 'bg-accent/10'} flex items-center justify-center`}>
                <Wallet className={`w-5 h-5 ${isWrongNetwork ? 'text-destructive' : 'text-accent'}`} weight="fill" />
              </div>
              <div>
                <CardTitle className="text-lg">Wallet Connected</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`${isWrongNetwork ? 'bg-destructive/10 text-destructive border-destructive/30' : 'bg-accent/10 text-accent border-accent/30'}`}>
                    {isWrongNetwork ? (
                      <>
                        <Warning className="w-3 h-3 mr-1" weight="fill" />
                        Wrong Network
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" weight="fill" />
                        Active
                      </>
                    )}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={onDisconnect}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              Disconnect
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isWrongNetwork && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
              <Warning className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-destructive font-medium mb-2">
                  Please switch to Ethereum Mainnet
                </p>
                <Button
                  onClick={onSwitchNetwork}
                  size="sm"
                  variant="destructive"
                  className="gap-2"
                >
                  Switch Network
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm text-muted-foreground">Connected Address</span>
            <code className="text-xs font-mono bg-background px-2 py-1 rounded">
              {address ? formatAddress(address) : ''}
            </code>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">MNEE Balances</span>
              <span className="text-xs text-muted-foreground">Total: {totalMnee.toFixed(2)} MNEE</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <div className="p-3 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border border-accent/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-accent/50 bg-accent/10 text-accent px-2 py-0.5">
                      <span className="text-xs font-medium">ON-CHAIN</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">Real MNEE</span>
                  </div>
                  {hasOnChainMnee && (
                    <CheckCircle className="w-4 h-4 text-accent" weight="fill" />
                  )}
                </div>
                <div className="text-2xl font-mono font-bold text-accent">{mneeBalance}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  From Ethereum Mainnet
                </div>
              </div>

              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary px-2 py-0.5">
                      <Flask className="w-3 h-3 mr-1" weight="fill" />
                      <span className="text-xs font-medium">TEST</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">Demo only</span>
                  </div>
                  {hasTestMnee && (
                    <CheckCircle className="w-4 h-4 text-primary" weight="fill" />
                  )}
                </div>
                <div className="text-2xl font-mono font-bold text-primary">{testMneeBalance.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  From test faucet • Not real currency
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">ETH Balance</div>
            <div className="text-lg font-mono font-bold">{ethBalance}</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm text-muted-foreground">MNEE Contract</span>
            <code className="text-xs font-mono bg-background px-2 py-1 rounded">
              {formatAddress(MNEE_CONTRACT_ADDRESS)}
            </code>
          </div>

          {!isWrongNetwork && (
            <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <CheckCircle className="w-5 h-5 text-accent shrink-0" weight="fill" />
              <p className="text-sm text-accent-foreground">
                Your agents can now make autonomous purchases
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
