import { useEffect } from 'react'
import { toast } from 'sonner'
import { UserPlus, Heart, ChatCircle, Trophy } from '@phosphor-icons/react'
import type { UserProfile, SocialPost } from '@/lib/types'

interface SocialNotificationsProps {
  currentUserAddress: string
  socialProfiles: UserProfile[]
  socialPosts: SocialPost[]
  previousFollowerCount?: number
  previousLikesCount?: number
}

export default function SocialNotifications({
  currentUserAddress,
  socialProfiles,
  socialPosts,
  previousFollowerCount,
  previousLikesCount,
}: SocialNotificationsProps) {
  const currentProfile = socialProfiles.find(p => p.walletAddress === currentUserAddress)
  
  useEffect(() => {
    if (!currentProfile || previousFollowerCount === undefined) return
    
    const currentFollowerCount = currentProfile.followers.length
    if (currentFollowerCount > previousFollowerCount) {
      const newFollowers = currentFollowerCount - previousFollowerCount
      toast.success(
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-accent" weight="bold" />
          <div>
            <p className="font-semibold">New Follower{newFollowers > 1 ? 's' : ''}!</p>
            <p className="text-xs text-muted-foreground">
              {newFollowers} user{newFollowers > 1 ? 's' : ''} started following you
            </p>
          </div>
        </div>,
        {
          duration: 5000,
        }
      )
    }
  }, [currentProfile?.followers.length, previousFollowerCount])

  useEffect(() => {
    if (!currentProfile || previousLikesCount === undefined) return
    
    const userPosts = socialPosts.filter(p => p.authorAddress === currentUserAddress)
    const currentLikesCount = userPosts.reduce((sum, p) => sum + p.likes.length, 0)
    
    if (currentLikesCount > previousLikesCount) {
      const newLikes = currentLikesCount - previousLikesCount
      toast.success(
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" weight="fill" />
          <div>
            <p className="font-semibold">Your Post Got Liked!</p>
            <p className="text-xs text-muted-foreground">
              {newLikes} new like{newLikes > 1 ? 's' : ''} on your posts
            </p>
          </div>
        </div>,
        {
          duration: 4000,
        }
      )
    }
  }, [socialPosts, previousLikesCount, currentUserAddress])

  return null
}
