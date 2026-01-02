import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EnvelopeSimple, Envelope, Checks } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import type { DirectConversation, DirectMessage } from '@/lib/types'

interface DirectMessageNotificationProps {
  currentUserAddress: string | null
  onViewMessages: () => void
}

export default function DirectMessageNotification({ 
  currentUserAddress, 
  onViewMessages 
}: DirectMessageNotificationProps) {
  const [conversations] = useKV<DirectConversation[]>('dm-conversations', [])
  const [messages] = useKV<DirectMessage[]>('dm-messages', [])

  if (!currentUserAddress) return null

  const unreadConversations = (conversations || [])
    .filter(conv => {
      const unreadCount = conv.unreadCount.get(currentUserAddress) || 0
      return conv.status === 'active' && unreadCount > 0
    })
    .sort((a, b) => b.lastMessageTime - a.lastMessageTime)
    .slice(0, 5)

  const totalUnread = (conversations || [])
    .filter(conv => conv.status === 'active')
    .reduce((sum, conv) => sum + (conv.unreadCount.get(currentUserAddress) || 0), 0)

  const getOtherParticipantName = (conversation: DirectConversation) => {
    const otherParticipant = conversation.participants.find(p => p !== currentUserAddress)
    return otherParticipant ? conversation.participantNames.get(otherParticipant) || 'Unknown' : 'Unknown'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {totalUnread > 0 ? (
            <Envelope className="w-5 h-5" weight="fill" />
          ) : (
            <EnvelopeSimple className="w-5 h-5" />
          )}
          {totalUnread > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 rounded-full px-1.5 py-0 text-xs min-w-[18px] h-[18px] flex items-center justify-center"
            >
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <EnvelopeSimple className="w-4 h-4" />
              Messages
            </h4>
            {totalUnread > 0 && (
              <Badge variant="secondary">
                {totalUnread} new
              </Badge>
            )}
          </div>
          
          {unreadConversations.length > 0 ? (
            <>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {unreadConversations.map(conversation => {
                    const otherName = getOtherParticipantName(conversation)
                    const unreadCount = conversation.unreadCount.get(currentUserAddress) || 0

                    return (
                      <button
                        key={conversation.id}
                        onClick={onViewMessages}
                        className="w-full flex items-start gap-3 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarFallback className="bg-accent/20 text-accent-foreground">
                            {getInitials(otherName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm truncate">{otherName}</span>
                            <Badge variant="default" className="rounded-full px-2 text-xs">
                              {unreadCount}
                            </Badge>
                          </div>
                          {conversation.lastMessage && (
                            <>
                              <p className="text-xs text-muted-foreground truncate">
                                {conversation.lastMessage.content}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(conversation.lastMessageTime, { addSuffix: true })}
                              </p>
                            </>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
              <Button 
                onClick={onViewMessages} 
                className="w-full"
                variant="outline"
              >
                View All Messages
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Checks className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No new messages</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
