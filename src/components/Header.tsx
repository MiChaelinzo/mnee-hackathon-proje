import { Button } from '@/components/ui/button'
import { Wallet, Warning } from '@phosphor-icons/react'
import { MNEE_CONTRACT_ADDRESS, formatAddress } from '@/lib/mnee'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  address: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  mneeBalance: string
  ethBalance: string
  onConnect: () => void
  onDisconnect: () => void
  onSwitchNetwork: () => void
}

export default function Header({ 
  address, 
  chainId, 
  isConnected, 
  isConnecting,
  mneeBalance,
  ethBalance,
  onConnect, 
  onDisconnect,
  onSwitchNetwork
}: HeaderProps) {
  const isWrongNetwork = isConnected && chainId !== 1

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
          {isConnected && (
            <div className="hidden md:flex flex-col items-end gap-0.5">
              <div className="text-xs text-muted-foreground">MNEE Balance</div>
              <div className="text-sm font-mono font-semibold text-accent">{mneeBalance} MNEE</div>
            </div>
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
            <div className="flex items-center gap-2 text-xs flex-wrap">
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
