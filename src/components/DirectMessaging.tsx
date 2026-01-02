import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PaperPlaneRight, 
  MagnifyingGlass, 
  Paperclip, 
  Image as ImageIcon, 
  Smiley,
  DotsThree,
  Trash,
  PencilSimple,
  Check,
  Checks,
  X,
  UserPlus,
  Archive,
  Prohibit,
  ChatCircle,
  Users,
  Clock,
  ArrowLeft
} from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import type { DirectConversation, DirectMessage, DirectMessageAttachment, UserProfile as SocialUserProfile, Agent } from '@/lib/types'

const EMOJI_LIST = [
  '😊', '😂', '❤️', '🔥', '👍', '👏', '🎉', '💯',
  '😍', '🤔', '😎', '🙌', '✨', '💪', '🚀', '⭐',
  '😅', '🤗', '😢', '😡', '🤯', '👀', '💡', '🎯'
]

interface DirectMessagingProps {
  currentUserAddress: string
  socialProfiles: SocialUserProfile[]
  agents: Agent[]
}

export default function DirectMessaging({ currentUserAddress, socialProfiles, agents }: DirectMessagingProps) {
  const [conversations, setConversations] = useKV<DirectConversation[]>('dm-conversations', [])
  const [messages, setMessages] = useKV<DirectMessage[]>('dm-messages', [])
  const [selectedConversation, setSelectedConversation] = useState<DirectConversation | null>(null)
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [replyToMessage, setReplyToMessage] = useState<DirectMessage | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentProfile = socialProfiles.find(p => p.walletAddress === currentUserAddress)
  const currentAgent = agents.find(a => a.address === currentUserAddress)
  const currentUserName = currentProfile?.username || currentAgent?.name || 'You'

  useEffect(() => {
    if (selectedConversation && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, selectedConversation])

  useEffect(() => {
    if (selectedConversation) {
      markMessagesAsRead(selectedConversation.id)
    }
  }, [selectedConversation, messages])

  useEffect(() => {
    const handleStartConversation = (event: Event) => {
      const customEvent = event as CustomEvent<{ userAddress: string }>
      if (customEvent.detail?.userAddress) {
        startNewConversation(customEvent.detail.userAddress)
      }
    }

    window.addEventListener('start-dm-conversation', handleStartConversation)
    return () => {
      window.removeEventListener('start-dm-conversation', handleStartConversation)
    }
  }, [conversations, currentUserAddress, socialProfiles, agents])

  const markMessagesAsRead = (conversationId: string) => {
    const now = Date.now()
    setMessages((current = []) =>
      current.map(msg =>
        msg.conversationId === conversationId && 
        msg.recipientId === currentUserAddress && 
        !msg.readAt
          ? { ...msg, readAt: now }
          : msg
      )
    )

    setConversations((current = []) =>
      current.map(conv => {
        if (conv.id === conversationId) {
          const newUnreadCount = new Map(conv.unreadCount)
          newUnreadCount.set(currentUserAddress, 0)
          return { ...conv, unreadCount: newUnreadCount }
        }
        return conv
      })
    )
  }

  const startNewConversation = (recipientAddress: string) => {
    const existingConv = (conversations || []).find(conv =>
      conv.participants.includes(recipientAddress) && 
      conv.participants.includes(currentUserAddress)
    )

    if (existingConv) {
      setSelectedConversation(existingConv)
      setIsNewChatOpen(false)
      return
    }

    const recipientProfile = socialProfiles.find(p => p.walletAddress === recipientAddress)
    const recipientAgent = agents.find(a => a.address === recipientAddress)
    const recipientName = recipientProfile?.username || recipientAgent?.name || 'Unknown'

    const participantNames = new Map<string, string>()
    participantNames.set(currentUserAddress, currentUserName)
    participantNames.set(recipientAddress, recipientName)

    const newConversation: DirectConversation = {
      id: crypto.randomUUID(),
      participants: [currentUserAddress, recipientAddress],
      participantNames,
      lastMessage: null,
      lastMessageTime: Date.now(),
      unreadCount: new Map([[currentUserAddress, 0], [recipientAddress, 0]]),
      createdAt: Date.now(),
      status: 'active'
    }

    setConversations((current = []) => [newConversation, ...current])
    setSelectedConversation(newConversation)
    setIsNewChatOpen(false)
    toast.success(`Started conversation with ${recipientName}`)
  }

  const sendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return

    const otherParticipant = selectedConversation.participants.find(p => p !== currentUserAddress)
    if (!otherParticipant) return

    const newMessage: DirectMessage = {
      id: crypto.randomUUID(),
      conversationId: selectedConversation.id,
      senderId: currentUserAddress,
      senderName: currentUserName,
      recipientId: otherParticipant,
      content: messageText.trim(),
      timestamp: Date.now(),
      deliveredAt: Date.now(),
      reactions: []
    }

    setMessages((current = []) => [...current, newMessage])

    setConversations((current = []) =>
      current.map(conv => {
        if (conv.id === selectedConversation.id) {
          const newUnreadCount = new Map(conv.unreadCount)
          const currentRecipientCount = newUnreadCount.get(otherParticipant) || 0
          newUnreadCount.set(otherParticipant, currentRecipientCount + 1)
          
          return {
            ...conv,
            lastMessage: newMessage,
            lastMessageTime: newMessage.timestamp,
            unreadCount: newUnreadCount
          }
        }
        return conv
      })
    )

    setMessageText('')
    setReplyToMessage(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleEditMessage = (message: DirectMessage) => {
    setEditingMessageId(message.id)
    setEditText(message.content)
  }

  const saveEdit = () => {
    if (!editText.trim() || !editingMessageId) return

    setMessages((current = []) =>
      current.map(msg =>
        msg.id === editingMessageId
          ? { ...msg, content: editText.trim(), edited: true, editedAt: Date.now() }
          : msg
      )
    )

    setEditingMessageId(null)
    setEditText('')
    toast.success('Message updated')
  }

  const deleteMessage = (messageId: string) => {
    setMessages((current = []) =>
      current.map(msg =>
        msg.id === messageId
          ? { ...msg, deleted: true, content: 'This message was deleted' }
          : msg
      )
    )
    toast.success('Message deleted')
  }

  const addReaction = (messageId: string, emoji: string) => {
    setMessages((current = []) =>
      current.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find(
            r => r.emoji === emoji && r.userId === currentUserAddress
          )
          
          if (existingReaction) {
            return {
              ...msg,
              reactions: msg.reactions?.filter(
                r => !(r.emoji === emoji && r.userId === currentUserAddress)
              )
            }
          } else {
            return {
              ...msg,
              reactions: [
                ...(msg.reactions || []),
                {
                  emoji,
                  userId: currentUserAddress,
                  userName: currentUserName,
                  timestamp: Date.now()
                }
              ]
            }
          }
        }
        return msg
      })
    )
  }

  const archiveConversation = (conversationId: string) => {
    setConversations((current = []) =>
      current.map(conv =>
        conv.id === conversationId
          ? { ...conv, status: 'archived' as const }
          : conv
      )
    )
    setSelectedConversation(null)
    toast.success('Conversation archived')
  }

  const blockConversation = (conversationId: string) => {
    setConversations((current = []) =>
      current.map(conv =>
        conv.id === conversationId
          ? { ...conv, status: 'blocked' as const }
          : conv
      )
    )
    setSelectedConversation(null)
    toast.success('User blocked')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    toast.info('File attachment feature - files would be uploaded here')
  }

  const filteredConversations = (conversations || []).filter(conv => {
    if (!searchQuery) return conv.status === 'active'
    
    const otherParticipant = conv.participants.find(p => p !== currentUserAddress)
    const otherName = otherParticipant ? conv.participantNames.get(otherParticipant) : ''
    
    return conv.status === 'active' && 
           otherName?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const conversationMessages = selectedConversation
    ? (messages || []).filter(msg => msg.conversationId === selectedConversation.id)
    : []

  const availableUsers = [...socialProfiles, ...agents.map(a => ({
    walletAddress: a.address,
    username: a.name,
    bio: undefined,
    avatarUrl: undefined,
    joinedAt: 0,
    isVerified: false,
    reputation: 0,
    followers: [],
    following: [],
    badges: [],
    socialStats: {
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0
    }
  }))]
    .filter((user, index, self) => 
      user.walletAddress !== currentUserAddress &&
      self.findIndex(u => u.walletAddress === user.walletAddress) === index
    )

  const totalUnreadCount = (conversations || [])
    .reduce((sum, conv) => sum + (conv.unreadCount.get(currentUserAddress) || 0), 0)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getOtherParticipantName = (conversation: DirectConversation) => {
    const otherParticipant = conversation.participants.find(p => p !== currentUserAddress)
    return otherParticipant ? conversation.participantNames.get(otherParticipant) || 'Unknown' : 'Unknown'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
      <Card className="lg:col-span-4 flex flex-col card-gradient border-border/50">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <ChatCircle className="w-5 h-5 text-primary" />
                Messages
              </CardTitle>
              {totalUnreadCount > 0 && (
                <Badge variant="destructive" className="rounded-full px-2">
                  {totalUnreadCount}
                </Badge>
              )}
            </div>
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {availableUsers
                        .filter(user =>
                          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(user => (
                          <motion.button
                            key={user.walletAddress}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => startNewConversation(user.walletAddress)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                          >
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {getInitials(user.username || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                              <div className="font-semibold">{user.username || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
                              </div>
                            </div>
                            {user.isVerified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </motion.button>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative mt-4">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="space-y-1 p-4">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-1">Start chatting with other users</p>
                </div>
              ) : (
                filteredConversations.map(conversation => {
                  const otherParticipantName = getOtherParticipantName(conversation)
                  const unreadCount = conversation.unreadCount.get(currentUserAddress) || 0
                  const isSelected = selectedConversation?.id === conversation.id

                  return (
                    <motion.button
                      key={conversation.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-primary/20 border-2 border-primary'
                          : 'bg-secondary/30 hover:bg-secondary/50 border-2 border-transparent'
                      }`}
                    >
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarFallback className="bg-accent/20 text-accent-foreground">
                          {getInitials(otherParticipantName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold truncate">{otherParticipantName}</span>
                          {conversation.lastMessage && (
                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                              {formatDistanceToNow(conversation.lastMessageTime, { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.senderId === currentUserAddress && 'You: '}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <Badge variant="default" className="rounded-full px-2 flex-shrink-0">
                          {unreadCount}
                        </Badge>
                      )}
                    </motion.button>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="lg:col-span-8 flex flex-col card-gradient border-border/50">
        {selectedConversation ? (
          <>
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-accent/20 text-accent-foreground">
                      {getInitials(getOtherParticipantName(selectedConversation))}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{getOtherParticipantName(selectedConversation)}</h3>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <DotsThree className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48" align="end">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => archiveConversation(selectedConversation.id)}
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-destructive"
                        onClick={() => blockConversation(selectedConversation.id)}
                      >
                        <Prohibit className="w-4 h-4" />
                        Block User
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 overflow-hidden p-4">
              <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="space-y-4">
                  <AnimatePresence>
                    {conversationMessages.map(message => {
                      const isOwn = message.senderId === currentUserAddress
                      const isEditing = editingMessageId === message.id

                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isOwn && (
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback className="bg-accent/20 text-accent-foreground text-xs">
                                  {getInitials(message.senderName)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                              {message.replyTo && (
                                <div className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded">
                                  Replying to message
                                </div>
                              )}
                              <div
                                className={`relative group rounded-lg px-4 py-2 ${
                                  isOwn
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-secondary-foreground'
                                } ${message.deleted ? 'italic opacity-70' : ''}`}
                              >
                                {isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="min-w-[200px]"
                                      autoFocus
                                    />
                                    <Button size="icon" variant="ghost" onClick={saveEdit}>
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingMessageId(null)
                                        setEditText('')
                                      }}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm break-words">{message.content}</p>
                                    {message.edited && (
                                      <span className="text-xs opacity-70 ml-2">(edited)</span>
                                    )}
                                    {!message.deleted && isOwn && (
                                      <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <Button
                                          size="icon"
                                          variant="secondary"
                                          className="w-6 h-6"
                                          onClick={() => handleEditMessage(message)}
                                        >
                                          <PencilSimple className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="secondary"
                                          className="w-6 h-6"
                                          onClick={() => deleteMessage(message.id)}
                                        >
                                          <Trash className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {message.reactions && message.reactions.length > 0 && (
                                  <div className="flex gap-1 bg-secondary/50 rounded-full px-2 py-1">
                                    {Array.from(new Set(message.reactions.map(r => r.emoji))).map(emoji => {
                                      const count = message.reactions!.filter(r => r.emoji === emoji).length
                                      return (
                                        <button
                                          key={emoji}
                                          onClick={() => addReaction(message.id, emoji)}
                                          className="text-xs hover:scale-110 transition-transform"
                                        >
                                          {emoji} {count > 1 && count}
                                        </button>
                                      )
                                    })}
                                  </div>
                                )}
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-6 h-6 opacity-0 group-hover:opacity-100"
                                    >
                                      <Smiley className="w-3 h-3" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-64" align={isOwn ? 'end' : 'start'}>
                                    <div className="grid grid-cols-8 gap-1">
                                      {EMOJI_LIST.map(emoji => (
                                        <button
                                          key={emoji}
                                          onClick={() => addReaction(message.id, emoji)}
                                          className="text-xl hover:scale-125 transition-transform p-1"
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                                  {isOwn && message.readAt && (
                                    <Checks className="w-3 h-3 text-accent" />
                                  )}
                                  {isOwn && !message.readAt && message.deliveredAt && (
                                    <Check className="w-3 h-3" />
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
            <Separator />
            <CardContent className="flex-shrink-0 p-4">
              {replyToMessage && (
                <div className="mb-2 p-2 bg-secondary/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Replying to:</span>
                    <span className="truncate max-w-[300px]">{replyToMessage.content}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-6 h-6"
                    onClick={() => setReplyToMessage(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0"
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
                <Textarea
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                  rows={2}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                  className="flex-shrink-0 gap-2"
                  size="lg"
                >
                  <PaperPlaneRight className="w-5 h-5" />
                  Send
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <ChatCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a conversation from the list or start a new one</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
