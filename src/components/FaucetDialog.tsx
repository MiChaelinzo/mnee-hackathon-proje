import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useKV } from '@github/spark/hooks'
import { Drop, Wallet, CheckCircle, Warning, Flask } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface FaucetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userAddress: string | null
  onFaucetClaim: (amount: number) => void
}

interface FaucetClaim {
  address: string
  amount: number
  timestamp: number
}

const FAUCET_AMOUNTS = [
  { label: '100 MNEE', value: 100, popular: false },
  { label: '500 MNEE', value: 500, popular: true },
  { label: '1,000 MNEE', value: 1000, popular: false },
]

const COOLDOWN_PERIOD = 60 * 60 * 1000

export default function FaucetDialog({ open, onOpenChange, userAddress, onFaucetClaim }: FaucetDialogProps) {
  const [faucetClaims, setFaucetClaims] = useKV<FaucetClaim[]>('faucet-claims', [])
  const [selectedAmount, setSelectedAmount] = useState(500)
  const [customAmount, setCustomAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const getLastClaimTime = () => {
    if (!userAddress || !faucetClaims) return null
    const userClaims = faucetClaims.filter(claim => claim.address.toLowerCase() === userAddress.toLowerCase())
    if (userClaims.length === 0) return null
    return Math.max(...userClaims.map(claim => claim.timestamp))
  }

  const canClaim = () => {
    if (!userAddress) return false
    const lastClaimTime = getLastClaimTime()
    if (!lastClaimTime) return true
    return Date.now() - lastClaimTime >= COOLDOWN_PERIOD
  }

  const getTimeUntilNextClaim = () => {
    const lastClaimTime = getLastClaimTime()
    if (!lastClaimTime) return 0
    const timeSince = Date.now() - lastClaimTime
    const timeRemaining = COOLDOWN_PERIOD - timeSince
    return Math.max(0, timeRemaining)
  }

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const handleClaim = async () => {
    if (!userAddress) {
      toast.error('No wallet connected', {
        description: 'Please connect your wallet first.',
      })
      return
    }

    if (!canClaim()) {
      toast.error('Cooldown Active', {
        description: `Please wait ${formatTimeRemaining(getTimeUntilNextClaim())} before claiming again.`,
      })
      return
    }

    const amount = customAmount ? parseFloat(customAmount) : selectedAmount
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid Amount', {
        description: 'Please enter a valid amount.',
      })
      return
    }

    if (amount > 10000) {
      toast.error('Amount Too High', {
        description: 'Maximum faucet amount is 10,000 MNEE.',
      })
      return
    }

    setIsProcessing(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newClaim: FaucetClaim = {
        address: userAddress,
        amount,
        timestamp: Date.now(),
      }

      setFaucetClaims((current = []) => [...current, newClaim])
      
      onFaucetClaim(amount)

      toast.success('Test MNEE Claimed!', {
        description: `${amount} test MNEE added to your demo balance (not real currency).`,
        icon: <Flask className="text-primary" weight="fill" />,
      })

      onOpenChange(false)
      setCustomAmount('')
    } catch (error) {
      console.error('Faucet error:', error)
      toast.error('Claim Failed', {
        description: 'Something went wrong. Please try again.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const totalClaimed = faucetClaims?.reduce((sum, claim) => 
    claim.address.toLowerCase() === userAddress?.toLowerCase() ? sum + claim.amount : sum, 0
  ) || 0

  const claimCount = faucetClaims?.filter(claim => 
    claim.address.toLowerCase() === userAddress?.toLowerCase()
  ).length || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-primary/20">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Flask className="w-6 h-6 text-primary" weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-2xl">Test MNEE Faucet</DialogTitle>
                <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary px-2 py-0.5">
                  <span className="text-xs font-medium">DEMO</span>
                </Badge>
              </div>
              <DialogDescription className="text-base mt-1">
                Get free test tokens for demo purposes only
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!userAddress ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Wallet className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Please connect your wallet to claim test MNEE
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                {FAUCET_AMOUNTS.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedAmount(option.value)
                      setCustomAmount('')
                    }}
                    className={cn(
                      'relative p-4 rounded-lg border-2 transition-all text-center',
                      selectedAmount === option.value && !customAmount
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    )}
                  >
                    {option.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                        Popular
                      </span>
                    )}
                    <div className="font-semibold">{option.label}</div>
                  </motion.button>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-amount">Custom Amount</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="Enter custom amount (max 10,000)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  max={10000}
                  min={1}
                />
              </div>

              <AnimatePresence>
                {!canClaim() && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <Warning className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" weight="fill" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-destructive">Cooldown Active</p>
                      <p className="text-xs text-muted-foreground">
                        Next claim available in {formatTimeRemaining(getTimeUntilNextClaim())}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-2">
                  <Flask className="w-5 h-5 text-primary mt-0.5 shrink-0" weight="fill" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-primary">About Test MNEE</p>
                    <p className="text-xs text-muted-foreground">
                      Test MNEE is a demo currency for exploring the marketplace. It has no real value and cannot be withdrawn or converted to real MNEE. Use the faucet to experiment with AI agent purchases.
                    </p>
                  </div>
                </div>
              </div>

              {userAddress && claimCount > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" weight="fill" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Your Faucet Stats</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Claims: {claimCount}</span>
                      <span>Total: {totalClaimed.toLocaleString()} test MNEE</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleClaim}
                  disabled={!canClaim() || isProcessing}
                  className="flex-1 gap-2"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Flask className="w-4 h-4" weight="fill" />
                      </motion.div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Flask className="w-4 h-4" weight="fill" />
                      Claim {customAmount || selectedAmount} Test MNEE
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                ⏱️ Cooldown: 1 hour between claims • 🧪 Demo currency only
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
