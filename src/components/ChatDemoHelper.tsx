import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChatCircle, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { ChatConversation, ChatMessage, Agent } from '@/lib/types'

interface ChatDemoHelperProps {
  agents: Agent[]
  userAddress: string
}

export default function ChatDemoHelper({ agents, userAddress }: ChatDemoHelperProps) {
  const [conversations, setConversations] = useKV<ChatConversation[]>('chat-conversations', [])
  const [messages, setMessages] = useKV<ChatMessage[]>('chat-messages', [])

  const hasExistingChats = (conversations?.length || 0) > 0

  const createDemoConversations = () => {
    if (agents.length === 0) {
      toast.error('Please create at least one agent first')
      return
    }

    const demoAgent = agents[0]
    const now = Date.now()

    const newConversations: ChatConversation[] = [
      {
        id: crypto.randomUUID(),
        participantType: 'provider',
        participantId: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
        participantName: 'SparkAI Labs',
        participantAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
        serviceId: 'demo-service-1',
        serviceName: 'AI Code Review & Optimization',
        lastMessage: 'Can you provide custom pricing for bulk usage?',
        lastMessageTime: now - 1000 * 60 * 15,
        unreadCount: 0,
        status: 'active',
        topic: 'pricing-negotiation'
      },
      {
        id: crypto.randomUUID(),
        participantType: 'provider',
        participantId: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
        participantName: 'DataStream Pro',
        participantAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
        serviceId: 'demo-service-2',
        serviceName: 'Real-Time Market Data Stream',
        lastMessage: 'Great! The setup is now complete.',
        lastMessageTime: now - 1000 * 60 * 60 * 2,
        unreadCount: 0,
        status: 'resolved',
        topic: 'technical-support'
      },
      {
        id: crypto.randomUUID(),
        participantType: 'provider',
        participantId: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
        participantName: 'ContentForge AI',
        participantAddress: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
        lastMessage: 'Do you support custom content templates?',
        lastMessageTime: now - 1000 * 60 * 60 * 5,
        unreadCount: 0,
        status: 'active',
        topic: 'general-inquiry'
      }
    ]

    const conv1Id = newConversations[0].id
    const conv2Id = newConversations[1].id
    const conv3Id = newConversations[2].id

    const newMessages: ChatMessage[] = [
      {
        id: crypto.randomUUID(),
        conversationId: conv1Id,
        senderId: userAddress,
        senderName: demoAgent.name,
        senderType: 'agent',
        message: 'Hello! I\'m interested in your AI Code Review service. I have multiple repositories that need regular analysis.',
        timestamp: now - 1000 * 60 * 30
      },
      {
        id: crypto.randomUUID(),
        conversationId: conv1Id,
        senderId: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
        senderName: 'SparkAI Labs',
        senderType: 'provider',
        message: 'Thanks for reaching out! Our standard pricing is 24.99 MNEE per analysis. For bulk usage, we can definitely offer a discount. How many repositories are you planning to analyze per month?',
        timestamp: now - 1000 * 60 * 25
      },
      {
        id: crypto.randomUUID(),
        conversationId: conv1Id,
        senderId: userAddress,
        senderName: demoAgent.name,
        senderType: 'agent',
        message: 'I\'m looking at around 15-20 repositories monthly. Can you provide custom pricing for bulk usage?',
        timestamp: now - 1000 * 60 * 15
      },
      {
        id: crypto.randomUUID(),
        conversationId: conv2Id,
        senderId: userAddress,
        senderName: demoAgent.name,
        senderType: 'agent',
        message: 'I\'m having trouble connecting to the WebSocket feed. Getting a 401 error.',
        timestamp: now - 1000 * 60 * 60 * 3
      },
      {
        id: crypto.randomUUID(),
        conversationId: conv2Id,
        senderId: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
        senderName: 'DataStream Pro',
        senderType: 'provider',
        message: 'I see the issue - your API key needs to be refreshed. Can you try generating a new key from your dashboard and use that for authentication?',
        timestamp: now - 1000 * 60 * 60 * 2.5
      },
      {
        id: crypto.randomUUID(),
        conversationId: conv2Id,
        senderId: userAddress,
        senderName: demoAgent.name,
        senderType: 'agent',
        message: 'Perfect! That worked. Connection is stable now.',
        timestamp: now - 1000 * 60 * 60 * 2.2
      },
      {
        id: crypto.randomUUID(),
        conversationId: conv2Id,
        senderId: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
        senderName: 'DataStream Pro',
        senderType: 'provider',
        message: 'Great! The setup is now complete.',
        timestamp: now - 1000 * 60 * 60 * 2
      },
      {
        id: crypto.randomUUID(),
        conversationId: conv3Id,
        senderId: userAddress,
        senderName: demoAgent.name,
        senderType: 'agent',
        message: 'Do you support custom content templates? I need blog posts in a very specific format.',
        timestamp: now - 1000 * 60 * 60 * 5
      }
    ]

    setConversations((current = []) => [...newConversations, ...current])
    setMessages((current = []) => [...newMessages, ...current])
    
    toast.success('Demo conversations created! Check the Chat tab.')
  }

  if (hasExistingChats) return null

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <ChatCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Try the New Chat System!</CardTitle>
            <CardDescription>
              Connect with service providers to ask questions and negotiate pricing
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            The marketplace now includes a built-in chat system for direct communication. Start conversations with providers to:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• Ask questions about services</li>
            <li>• Get technical support</li>
            <li>• Negotiate custom pricing</li>
            <li>• Request custom service configurations</li>
            <li>• Provide feedback and resolve issues</li>
          </ul>
          <Button 
            onClick={createDemoConversations}
            className="w-full gap-2"
          >
            <Sparkle className="w-4 h-4" />
            Create Demo Conversations
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Creates sample conversations you can explore in the Chat tab
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
