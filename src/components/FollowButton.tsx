import { Button } from '@/components/ui/button'
import { UserPlus, UserMinus, Check } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface FollowButtonProps {
  isFollowing: boolean
  onFollow: () => void
  onUnfollow: () => void
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  showText?: boolean
  className?: string
}

export default function FollowButton({
  isFollowing,
  onFollow,
  onUnfollow,
  size = 'default',
  variant,
  showText = true,
  className = '',
}: FollowButtonProps) {
  const [isHovering, setIsHovering] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFollowing) {
      onUnfollow()
    } else {
      onFollow()
    }
  }

  if (isFollowing) {
    return (
      <Button
        size={size}
        variant={variant || "outline"}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`gap-2 transition-all ${className}`}
      >
        <motion.div
          animate={{ rotate: isHovering ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isHovering ? (
            <UserMinus className="w-4 h-4" />
          ) : (
            <Check className="w-4 h-4" />
          )}
        </motion.div>
        {showText && (
          <span>{isHovering ? 'Unfollow' : 'Following'}</span>
        )}
      </Button>
    )
  }

  return (
    <Button
      size={size}
      variant={variant || "default"}
      onClick={handleClick}
      className={`gap-2 ${className}`}
    >
      <UserPlus className="w-4 h-4" />
      {showText && <span>Follow</span>}
    </Button>
  )
}
