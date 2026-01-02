import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Users, TrendUp, Heart, Star, UserPlus } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { UserProfile } from '@/lib/types'

interface SocialStatsWidgetProps {
  currentUserAddress?: string
  socialProfiles: UserProfile[]
  onNavigateToSocial: () => void
}

export default function SocialStatsWidget({
  currentUserAddress,
  socialProfiles,
  onNavigateToSocial,
}: SocialStatsWidgetProps) {
  const currentProfile = currentUserAddress 
    ? socialProfiles.find(p => p.walletAddress === currentUserAddress)
    : null

  const topUsers = [...socialProfiles]
    .sort((a, b) => {
      const aScore = a.reputation + a.followers.length * 10
      const bScore = b.reputation + b.followers.length * 10
      return bScore - aScore
    })
    .slice(0, 3)

  if (!currentProfile) {
    return (
      <Card className="hover:border-primary/50 transition-all cursor-pointer" onClick={onNavigateToSocial}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Join the Community</p>
              <p className="text-xs text-muted-foreground">
                Connect with {socialProfiles.length} traders
              </p>
            </div>
            <UserPlus className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/30 hover:border-primary/50 transition-all">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Social Network</h3>
          </div>
          {currentProfile.isVerified && (
            <Badge variant="default" className="h-6 px-2">
              <Star className="w-3 h-3 mr-1" weight="fill" />
              Verified
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center p-2 bg-muted/50 rounded-lg cursor-pointer"
            onClick={onNavigateToSocial}
          >
            <p className="text-xl font-bold text-primary">{currentProfile.following.length}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center p-2 bg-muted/50 rounded-lg cursor-pointer"
            onClick={onNavigateToSocial}
          >
            <p className="text-xl font-bold text-accent">{currentProfile.followers.length}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center p-2 bg-muted/50 rounded-lg cursor-pointer"
            onClick={onNavigateToSocial}
          >
            <p className="text-xl font-bold text-primary">{currentProfile.reputation}</p>
            <p className="text-xs text-muted-foreground">Rep</p>
          </motion.div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Top Community Members</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={onNavigateToSocial}
            >
              View All →
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {topUsers.map((user, index) => (
              <motion.div
                key={user.walletAddress}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative cursor-pointer"
                onClick={onNavigateToSocial}
              >
                <Avatar className="w-10 h-10 border-2 border-primary/20 hover:border-primary transition-all">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {(user.username || 'A').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold">1</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <Heart className="w-4 h-4 text-red-500" weight="fill" />
          <p className="text-xs text-muted-foreground flex-1">
            {currentProfile.socialStats.totalLikes} total likes across your posts
          </p>
          <TrendUp className="w-4 h-4 text-accent" />
        </div>
      </CardContent>
    </Card>
  )
}
