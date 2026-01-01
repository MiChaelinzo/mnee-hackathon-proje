import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, ThumbsUp, ChatCircle } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { ServiceReview, Agent } from '@/lib/types'

interface ServiceReviewsProps {
  serviceId: string
  serviceName: string
  reviews: ServiceReview[]
  agents: Agent[]
  userHasPurchased: boolean
  onAddReview: (review: ServiceReview) => void
  onHelpfulClick: (reviewId: string) => void
}

export default function ServiceReviews({
  serviceId,
  serviceName,
  reviews,
  agents,
  userHasPurchased,
  onAddReview,
  onHelpfulClick,
}: ServiceReviewsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const serviceReviews = reviews.filter(r => r.serviceId === serviceId)
  const averageRating = serviceReviews.length > 0
    ? serviceReviews.reduce((acc, r) => acc + r.rating, 0) / serviceReviews.length
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: serviceReviews.filter(r => r.rating === stars).length,
    percentage: serviceReviews.length > 0
      ? (serviceReviews.filter(r => r.rating === stars).length / serviceReviews.length) * 100
      : 0,
  }))

  const handleSubmitReview = () => {
    if (!selectedAgent) {
      toast.error('Please select an agent')
      return
    }

    if (comment.trim().length < 10) {
      toast.error('Review must be at least 10 characters')
      return
    }

    const agent = agents.find(a => a.id === selectedAgent)
    if (!agent) return

    const review: ServiceReview = {
      id: crypto.randomUUID(),
      serviceId,
      agentId: agent.id,
      agentName: agent.name,
      rating,
      comment: comment.trim(),
      timestamp: Date.now(),
      helpful: 0,
    }

    onAddReview(review)
    setIsDialogOpen(false)
    setComment('')
    setRating(5)
    setSelectedAgent('')
    toast.success('Review submitted successfully!')
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ChatCircle className="w-5 h-5" />
                Reviews & Ratings
              </CardTitle>
              <CardDescription>
                {serviceReviews.length} {serviceReviews.length === 1 ? 'review' : 'reviews'} for {serviceName}
              </CardDescription>
            </div>
            {userHasPurchased && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Star className="w-4 h-4" />
                    Write Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                    <DialogDescription>
                      Share your experience with {serviceName}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Agent</label>
                      <select
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary rounded-md border border-input"
                      >
                        <option value="">Choose an agent...</option>
                        {agents.map(agent => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              weight={star <= rating ? 'fill' : 'regular'}
                              className={`w-8 h-8 ${
                                star <= rating ? 'text-accent' : 'text-muted-foreground'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Review</label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts about this service..."
                        rows={4}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {comment.length} / 500 characters
                      </p>
                    </div>

                    <Button
                      onClick={handleSubmitReview}
                      className="w-full"
                      disabled={!selectedAgent || comment.trim().length < 10}
                    >
                      Submit Review
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {serviceReviews.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="text-center p-6 bg-secondary rounded-lg">
                  <div className="text-5xl font-bold text-accent mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        weight={star <= Math.round(averageRating) ? 'fill' : 'regular'}
                        className="w-5 h-5 text-accent"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {serviceReviews.length} reviews
                  </p>
                </div>

                <div className="space-y-2">
                  {ratingDistribution.map(({ stars, count, percentage }) => (
                    <div key={stars} className="flex items-center gap-2 text-sm">
                      <span className="w-12 text-right">{stars} star</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                {serviceReviews
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:border-primary/50 transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 bg-primary/20 flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {review.agentName.substring(0, 2).toUpperCase()}
                                </span>
                              </Avatar>
                              <div>
                                <p className="font-medium">{review.agentName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(review.timestamp)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  weight={star <= review.rating ? 'fill' : 'regular'}
                                  className="w-4 h-4 text-accent"
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-foreground/90 mb-3">
                            {review.comment}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onHelpfulClick(review.id)}
                              className="gap-2 text-muted-foreground hover:text-foreground"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              Helpful ({review.helpful})
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ChatCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No reviews yet</p>
              {userHasPurchased && (
                <p className="text-sm text-muted-foreground">
                  Be the first to review this service!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
