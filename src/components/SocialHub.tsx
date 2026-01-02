import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Users, 
  Heart, 
  ChatCircle, 
  ShareNetwork, 
  Star, 
  TrendUp,
  MagnifyingGlass,
  UserPlus,
  UserMinus,
  PaperPlaneTilt,
  Fire,
  Trophy,
  Lightning,
  Crown
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { UserProfile, SocialPost, Agent, Transaction, ServiceReview } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface SocialHubProps {
  currentUserAddress: string
  userProfiles: UserProfile[]
  onUpdateProfile: (profile: UserProfile) => void
  agents: Agent[]
  transactions: Transaction[]
  reviews: ServiceReview[]
  socialPosts: SocialPost[]
  onCreatePost: (post: SocialPost) => void
  onLikePost: (postId: string, userAddress: string) => void
  onCommentPost: (postId: string, comment: string) => void
  onFollowUser: (userAddress: string) => void
  onUnfollowUser: (userAddress: string) => void
  onMessageUser?: (userAddress: string) => void
}

export default function SocialHub({
  currentUserAddress,
  userProfiles,
  onUpdateProfile,
  agents,
  transactions,
  reviews,
  socialPosts,
  onCreatePost,
  onLikePost,
  onCommentPost,
  onFollowUser,
  onUnfollowUser,
  onMessageUser,
}: SocialHubProps) {
  const [activeTab, setActiveTab] = useState('feed')
  const [newPostContent, setNewPostContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showComments, setShowComments] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')

  const currentProfile = userProfiles.find(p => p.walletAddress === currentUserAddress)

  const getTopUsers = () => {
    return [...userProfiles]
      .sort((a, b) => {
        const aScore = a.reputation + a.followers.length * 10 + a.socialStats.totalLikes
        const bScore = b.reputation + b.followers.length * 10 + b.socialStats.totalLikes
        return bScore - aScore
      })
      .slice(0, 10)
  }

  const getSuggestedUsers = () => {
    if (!currentProfile) return []
    
    return userProfiles
      .filter(p => 
        p.walletAddress !== currentUserAddress &&
        !currentProfile.following.includes(p.walletAddress)
      )
      .sort((a, b) => {
        const aScore = a.reputation + a.followers.length * 5
        const bScore = b.reputation + b.followers.length * 5
        return bScore - aScore
      })
      .slice(0, 5)
  }

  const getFollowingUsers = () => {
    if (!currentProfile) return []
    return userProfiles.filter(p => currentProfile.following.includes(p.walletAddress))
  }

  const getFollowerUsers = () => {
    if (!currentProfile) return []
    return userProfiles.filter(p => currentProfile.followers.includes(p.walletAddress))
  }

  const getFilteredPosts = () => {
    let filtered = [...socialPosts].sort((a, b) => b.timestamp - a.timestamp)
    
    if (activeTab === 'following' && currentProfile) {
      filtered = filtered.filter(p => 
        currentProfile.following.includes(p.authorAddress) || 
        p.authorAddress === currentUserAddress
      )
    } else if (activeTab === 'trending') {
      filtered = filtered.sort((a, b) => {
        const aScore = a.likes.length * 2 + a.comments.length + a.shares
        const bScore = b.likes.length * 2 + b.comments.length + b.shares
        return bScore - aScore
      })
    }
    
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    return filtered
  }

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast.error('Please enter some content')
      return
    }

    const currentAgent = agents.find(a => a.address === currentUserAddress)
    
    const newPost: SocialPost = {
      id: crypto.randomUUID(),
      authorAddress: currentUserAddress,
      authorName: currentAgent?.name || currentProfile?.username || 'Anonymous',
      authorAvatar: currentProfile?.avatarUrl,
      content: newPostContent,
      timestamp: Date.now(),
      likes: [],
      comments: [],
      shares: 0,
      type: 'status',
      tags: extractHashtags(newPostContent),
    }

    onCreatePost(newPost)
    setNewPostContent('')
    toast.success('Post created!')
  }

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w]+/g
    const matches = text.match(hashtagRegex)
    return matches ? matches.map(tag => tag.slice(1)) : []
  }

  const handleFollow = (userAddress: string) => {
    onFollowUser(userAddress)
    toast.success('Now following user!')
  }

  const handleUnfollow = (userAddress: string) => {
    onUnfollowUser(userAddress)
    toast.success('Unfollowed user')
  }

  const handleLike = (postId: string) => {
    onLikePost(postId, currentUserAddress)
  }

  const handleComment = (postId: string) => {
    if (!commentText.trim()) return
    
    onCommentPost(postId, commentText)
    setCommentText('')
    toast.success('Comment added!')
  }

  const isFollowing = (userAddress: string) => {
    return currentProfile?.following.includes(userAddress) || false
  }

  const getUserStats = (userAddress: string) => {
    const userTransactions = transactions.filter(t => {
      const agent = agents.find(a => a.id === t.agentId)
      return agent?.address === userAddress
    })
    const userReviews = reviews.filter(r => {
      const agent = agents.find(a => a.id === r.agentId)
      return agent?.address === userAddress
    })
    const userPosts = socialPosts.filter(p => p.authorAddress === userAddress)
    
    return {
      totalSpent: userTransactions.reduce((sum, t) => sum + t.amount, 0),
      totalPurchases: userTransactions.length,
      totalReviews: userReviews.length,
      totalPosts: userPosts.length,
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Social Hub
          </h2>
          <p className="text-muted-foreground mt-1">
            Connect with the marketplace community
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-gradient border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PaperPlaneTilt className="w-5 h-5" />
                Create Post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                id="new-post-content"
                placeholder="Share your thoughts, achievements, or recommendations... Use #hashtags"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {newPostContent.length}/500 characters
                </p>
                <Button 
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                  className="gap-2"
                >
                  <PaperPlaneTilt className="w-4 h-4" />
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Social Feed</CardTitle>
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search-posts"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="feed" className="gap-2">
                    <Lightning className="w-4 h-4" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="following" className="gap-2">
                    <Users className="w-4 h-4" />
                    Following
                  </TabsTrigger>
                  <TabsTrigger value="trending" className="gap-2">
                    <Fire className="w-4 h-4" />
                    Trending
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[600px] mt-4">
                  <div className="space-y-4 pr-4">
                    <AnimatePresence mode="popLayout">
                      {getFilteredPosts().map((post) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                        >
                          <Card className="hover:border-primary/50 transition-all">
                            <CardContent className="pt-6">
                              <div className="flex gap-3">
                                <Avatar className="w-10 h-10 border-2 border-primary/20">
                                  <AvatarImage src={post.authorAvatar} />
                                  <AvatarFallback>
                                    {post.authorName.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="font-semibold">{post.authorName}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                                      </p>
                                    </div>
                                    <Badge variant={post.type === 'achievement' ? 'default' : 'outline'}>
                                      {post.type}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                                  
                                  {post.serviceName && (
                                    <Card className="bg-muted/50 border-accent/30">
                                      <CardContent className="p-3">
                                        <p className="text-xs font-medium text-accent">
                                          📦 {post.serviceName}
                                        </p>
                                      </CardContent>
                                    </Card>
                                  )}
                                  
                                  {post.tags && post.tags.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                      {post.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                          #{tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-4 pt-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleLike(post.id)}
                                      className={`gap-2 ${
                                        post.likes.includes(currentUserAddress) ? 'text-red-500' : ''
                                      }`}
                                    >
                                      <Heart 
                                        className="w-4 h-4" 
                                        weight={post.likes.includes(currentUserAddress) ? 'fill' : 'regular'}
                                      />
                                      {post.likes.length}
                                    </Button>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                                      className="gap-2"
                                    >
                                      <ChatCircle className="w-4 h-4" />
                                      {post.comments.length}
                                    </Button>
                                    
                                    <Button variant="ghost" size="sm" className="gap-2">
                                      <ShareNetwork className="w-4 h-4" />
                                      {post.shares}
                                    </Button>
                                  </div>
                                  
                                  {showComments === post.id && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="space-y-3 pt-3 border-t"
                                    >
                                      {post.comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-2 text-sm">
                                          <Avatar className="w-6 h-6">
                                            <AvatarFallback className="text-xs">
                                              {comment.authorName.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1">
                                            <p className="font-medium text-xs">{comment.authorName}</p>
                                            <p className="text-muted-foreground">{comment.content}</p>
                                          </div>
                                        </div>
                                      ))}
                                      
                                      <div className="flex gap-2">
                                        <Input
                                          id={`comment-${post.id}`}
                                          placeholder="Write a comment..."
                                          value={commentText}
                                          onChange={(e) => setCommentText(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                              e.preventDefault()
                                              handleComment(post.id)
                                            }
                                          }}
                                        />
                                        <Button 
                                          size="sm" 
                                          onClick={() => handleComment(post.id)}
                                          disabled={!commentText.trim()}
                                        >
                                          <PaperPlaneTilt className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {getFilteredPosts().length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No posts yet. Be the first to share!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                Top Users
              </CardTitle>
              <CardDescription>Most influential community members</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {getTopUsers().map((user, index) => {
                    const stats = getUserStats(user.walletAddress)
                    return (
                      <motion.div
                        key={user.walletAddress}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className="hover:border-primary/50 transition-all cursor-pointer"
                          onClick={() => setSelectedUser(user)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {index < 3 && (
                                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </div>
                                )}
                                <Avatar className="w-12 h-12 border-2 border-primary/20">
                                  <AvatarImage src={user.avatarUrl} />
                                  <AvatarFallback>
                                    {(user.username || 'A').slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold truncate">
                                    {user.username || `User ${user.walletAddress.slice(0, 6)}`}
                                  </p>
                                  {user.isVerified && (
                                    <Badge variant="default" className="h-5 px-1">
                                      <Star className="w-3 h-3" weight="fill" />
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {user.followers.length}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <TrendUp className="w-3 h-3" />
                                    {user.reputation}
                                  </span>
                                </div>
                              </div>
                              
                              {user.walletAddress !== currentUserAddress && (
                                <div className="flex gap-1">
                                  {onMessageUser && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onMessageUser(user.walletAddress)
                                      }}
                                    >
                                      <ChatCircle className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant={isFollowing(user.walletAddress) ? "outline" : "default"}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      isFollowing(user.walletAddress) 
                                        ? handleUnfollow(user.walletAddress)
                                        : handleFollow(user.walletAddress)
                                    }}
                                  >
                                    {isFollowing(user.walletAddress) ? (
                                      <UserMinus className="w-4 h-4" />
                                    ) : (
                                      <UserPlus className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Suggested to Follow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getSuggestedUsers().map((user) => (
                  <Card key={user.walletAddress} className="hover:border-primary/50 transition-all">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>
                            {(user.username || 'A').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {user.username || `User ${user.walletAddress.slice(0, 6)}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.followers.length} followers
                          </p>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handleFollow(user.walletAddress)}
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {currentProfile && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle>Your Network</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{currentProfile.following.length}</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-accent">{currentProfile.followers.length}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Reputation Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((currentProfile.reputation / 1000) * 100, 100)}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                    <span className="text-sm font-bold">{currentProfile.reputation}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarImage src={selectedUser.avatarUrl} />
                    <AvatarFallback>
                      {(selectedUser.username || 'A').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>
                        {selectedUser.username || `User ${selectedUser.walletAddress.slice(0, 8)}`}
                      </CardTitle>
                      {selectedUser.isVerified && (
                        <Crown className="w-5 h-5 text-accent" weight="fill" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {selectedUser.walletAddress.slice(0, 12)}...
                    </p>
                  </div>
                </div>
                {selectedUser.bio && (
                  <CardDescription className="mt-2">{selectedUser.bio}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-xl font-bold">{selectedUser.followers.length}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-xl font-bold">{selectedUser.following.length}</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-xl font-bold">{selectedUser.reputation}</p>
                    <p className="text-xs text-muted-foreground">Reputation</p>
                  </div>
                </div>
                
                {selectedUser.badges && selectedUser.badges.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Badges</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedUser.badges.map((badge) => (
                        <Badge key={badge} variant="secondary">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedUser.walletAddress !== currentUserAddress && (
                  <Button
                    className="w-full"
                    variant={isFollowing(selectedUser.walletAddress) ? "outline" : "default"}
                    onClick={() => {
                      isFollowing(selectedUser.walletAddress) 
                        ? handleUnfollow(selectedUser.walletAddress)
                        : handleFollow(selectedUser.walletAddress)
                    }}
                  >
                    {isFollowing(selectedUser.walletAddress) ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
