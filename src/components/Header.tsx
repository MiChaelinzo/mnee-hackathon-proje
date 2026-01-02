import { Button } from '@/components/ui/button'
import { Wallet, Warning, Drop, Flask, Question } from '@phosphor-icons/react'
import { MNEE_CONTRACT_ADDRESS, formatAddress } from '@/lib/mnee'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import MiniPersonalizedGreeting from './MiniPersonalizedGreeting'
import type { Agent } from '@/lib/types'

interface HeaderProps {
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
  onOpenFaucet: () => void
  onShowWelcome?: () => void
  agents?: Agent[]
}

export default function Header({ 
  address, 
  chainId, 
  isConnected, 
  isConnecting,
  mneeBalance,
  testMneeBalance,
  ethBalance,
  onConnect, 
  onDisconnect,
  onSwitchNetwork,
  onOpenFaucet,
  onShowWelcome,
  agents = []
}: HeaderProps) {
  const isWrongNetwork = isConnected && chainId !== 1
  const hasTestMnee = testMneeBalance > 0
  const hasOnChainMnee = parseFloat(mneeBalance) > 0

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center glow-primary">
            <span className="text-xl font-bold text-primary-foreground">M</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">MNEE Marketplace</h2>
            <p className="text-xs text-muted-foreground font-mono">
              {formatAddress(MNEE_CONTRACT_ADDRESS)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onShowWelcome && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onShowWelcome}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Question className="w-4 h-4" weight="bold" />
                    <span className="hidden lg:inline text-xs">Help</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Welcome Tour</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {isConnected && (
            <>
              <div className="hidden lg:flex flex-col items-end gap-1">
                {hasOnChainMnee && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-accent/50 bg-accent/10 text-accent px-1.5 py-0">
                      <span className="text-[10px] font-medium">ON-CHAIN</span>
                    </Badge>
                    <div className="text-sm font-mono font-semibold text-accent">
                      {mneeBalance} MNEE
                    </div>
                  </div>
                )}
                {hasTestMnee && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary px-1.5 py-0">
                      <Flask className="w-2.5 h-2.5 mr-0.5" weight="fill" />
                      <span className="text-[10px] font-medium">TEST</span>
                    </Badge>
                    <div className="text-sm font-mono font-semibold text-primary">
                      {testMneeBalance.toFixed(2)} MNEE
                    </div>
                  </div>
                )}
                {!hasOnChainMnee && !hasTestMnee && (
                  <div className="text-xs text-muted-foreground">No MNEE Balance</div>
                )}
              </div>
              
              <Button
                onClick={onOpenFaucet}
                variant="outline"
                size="sm"
                className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
              >
                <Flask className="w-4 h-4 text-primary" weight="fill" />
                <span className="hidden sm:inline">Test Faucet</span>
              </Button>
            </>
          )}
          
          <Button
            onClick={isConnected ? onDisconnect : onConnect}
            disabled={isConnecting}
            variant={isConnected ? 'secondary' : 'default'}
            className="gap-2"
          >
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isConnecting 
                ? 'Connecting...' 
                : isConnected && address 
                  ? formatAddress(address) 
                  : 'Connect Wallet'}
            </span>
            <span className="sm:hidden">
              {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Connect'}
            </span>
          </Button>
        </div>
      </div>

      {isConnected && (
        <div className="border-t border-border bg-muted/30 px-4 md:px-8 py-2">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <Badge 
                variant="outline" 
                className={`gap-1 ${isWrongNetwork ? 'border-destructive text-destructive' : ''}`}
              >
                <span className={`w-2 h-2 rounded-full ${isWrongNetwork ? 'bg-destructive' : 'bg-accent animate-pulse'}`} />
                {isWrongNetwork ? 'Wrong Network' : 'Ethereum Mainnet'}
              </Badge>
              <span className="text-muted-foreground hidden md:inline">•</span>
              <span className="text-muted-foreground hidden md:inline">
                ETH Balance: {ethBalance} ETH
              </span>
              {address && (
                <>
                  <span className="text-muted-foreground hidden md:inline">•</span>
                  <MiniPersonalizedGreeting 
                    walletAddress={address}
                    agents={agents}
                  />
                </>
              )}
            </div>

            {isWrongNetwork && (
              <Button
                onClick={onSwitchNetwork}
                size="sm"
                variant="destructive"
                className="gap-2 text-xs"
              >
                <Warning className="w-3 h-3" />
                Switch to Mainnet
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
