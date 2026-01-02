import { useKV } from '@github/spark/hooks'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Sparkle, Trophy } from '@phosphor-icons/react'
import { getTimeBasedGreeting, getWalletBasedPersonality } from '@/lib/personalization'
import type { UserProfile } from '@/lib/personalization'
import type { Agent } from '@/lib/types'

interface MiniPersonalizedGreetingProps {
  walletAddress: string
  agents: Agent[]
}

export default function MiniPersonalizedGreeting({ 
  walletAddress,
  agents,
}: MiniPersonalizedGreetingProps) {
  const [profile] = useKV<UserProfile | null>('user-profile', null)
  const [greeting, setGreeting] = useState('')
  const [persona, setPersona] = useState('')
  
  useEffect(() => {
    setGreeting(getTimeBasedGreeting())
    setPersona(getWalletBasedPersonality(walletAddress))
  }, [walletAddress])

  if (!profile) {
    return (
      <div className="hidden xl:flex items-center gap-2 text-sm">
        <Sparkle className="w-4 h-4 text-primary" weight="fill" />
        <span className="text-muted-foreground">{greeting}!</span>
      </div>
    )
  }

  const recentAchievements = profile.achievements.slice(-1)
  const showAchievement = recentAchievements.length > 0 && profile.lastVisit > Date.now() - 24 * 60 * 60 * 1000

  return (
    <div className="hidden xl:flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm">
        <Sparkle className="w-4 h-4 text-primary" weight="fill" />
        <span className="text-muted-foreground">{greeting},</span>
        <span className="font-semibold text-foreground">{persona}</span>
      </div>
      
      {showAchievement && (
        <Badge variant="secondary" className="gap-1.5 animate-pulse">
          <Trophy className="w-3 h-3 text-accent" weight="fill" />
          <span className="text-xs">New Achievement!</span>
        </Badge>
      )}
      
      {agents.length > 0 && (
        <Badge variant="outline" className="gap-1.5">
          <span className="text-xs font-semibold">{agents.length}</span>
          <span className="text-xs text-muted-foreground">Active Agent{agents.length !== 1 ? 's' : ''}</span>
        </Badge>
      )}
    </div>
  )
}
