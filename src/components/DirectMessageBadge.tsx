import { useKV } from '@github/spark/hooks'
import { Badge } from '@/components/ui/badge'
import type { DirectConversation } from '@/lib/types'

interface DirectMessageBadgeProps {
  currentUserAddress: string | null
}

export default function DirectMessageBadge({ currentUserAddress }: DirectMessageBadgeProps) {
  const [conversations] = useKV<DirectConversation[]>('dm-conversations', [])

  if (!currentUserAddress) return null

  const totalUnread = (conversations || [])
    .filter(conv => conv.status === 'active')
    .reduce((sum, conv) => sum + (conv.unreadCount.get(currentUserAddress) || 0), 0)

  if (totalUnread === 0) return null

  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 rounded-full px-1.5 py-0 text-xs min-w-[20px] h-5 flex items-center justify-center"
    >
      {totalUnread > 99 ? '99+' : totalUnread}
    </Badge>
  )
}
