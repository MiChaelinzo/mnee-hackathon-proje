import { Button } from '@/components/ui/button'
import { Wallet } from '@phosphor-icons/react'
import { MNEE_CONTRACT_ADDRESS, formatAddress } from '@/lib/mnee'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  walletConnected: boolean
  onWalletToggle: () => void
}

export default function Header({ walletConnected, onWalletToggle }: HeaderProps) {
  const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8'

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

        <Button
          onClick={onWalletToggle}
          variant={walletConnected ? 'secondary' : 'default'}
          className="gap-2"
        >
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">
            {walletConnected ? formatAddress(mockAddress) : 'Connect Wallet'}
          </span>
          <span className="sm:hidden">
            {walletConnected ? 'Connected' : 'Connect'}
          </span>
        </Button>
      </div>

      {walletConnected && (
        <div className="border-t border-border bg-muted/30 px-4 md:px-8 py-2">
          <div className="container mx-auto flex items-center gap-2 text-xs">
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Ethereum Mainnet
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              MNEE Contract: {formatAddress(MNEE_CONTRACT_ADDRESS)}
            </span>
          </div>
        </div>
      )}
    </header>
  )
}
