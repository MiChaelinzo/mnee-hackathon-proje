import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  ChatCircle, 
  PaperPlaneRight, 
  Archive, 
  CheckCircle, 
  Clock,
  User,
  Robot,
  Crown,
  CurrencyDollar,
  Warning,
  Funnel,
  MagnifyingGlass,
  Plus,
  File,
  X,
  Image as ImageIcon,
  Paperclip,
  FilePdf,
  FileCode,
  DownloadSimple,
  FileText,
  Microphone,
  Stop,
  Play,
  Pause,
  Smiley,
  DotsThree,
  PencilSimple,
  Trash,
  ArrowBendUpLeft,
  Checks,
  Eye
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { 
  ChatConversation, 
  ChatMessage, 
  ChatTopic, 
  Service, 
  Agent,
  NegotiationOffer,
  ChatAttachment,
  MessageReaction
} from '@/lib/types'

interface MarketplaceChatProps {
  services: Service[]
  agents: Agent[]
  userAddress: string
  userType: 'agent' | 'provider'
}

export default function MarketplaceChat({ 
  services, 
  agents, 
  userAddress,
  userType 
}: MarketplaceChatProps) {
  const [conversations, setConversations] = useKV<ChatConversation[]>('chat-conversations', [])
  const [messages, setMessages] = useKV<ChatMessage[]>('chat-messages', [])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [messageSearchQuery, setMessageSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved' | 'archived'>('all')
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [newChatForm, setNewChatForm] = useState({
    recipientType: 'provider' as 'provider' | 'agent',
    recipientId: '',
    serviceId: '',
    topic: 'general-inquiry' as ChatTopic,
    initialMessage: ''
  })
  const [negotiationOffer, setNegotiationOffer] = useState<Partial<NegotiationOffer> | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<{ file: File; url: string; type: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null)
  const [editText, setEditText] = useState('')
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, activeConversation])

  useEffect(() => {
    return () => {
      previewUrls.forEach(preview => URL.revokeObjectURL(preview.url))
    }
  }, [previewUrls])

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const activeConversationData = conversations?.find(c => c.id === activeConversation)
  const allConversationMessages = messages?.filter(m => m.conversationId === activeConversation && !m.deleted) || []
  
  const conversationMessages = messageSearchQuery
    ? allConversationMessages.filter(m => 
        m.message.toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
        m.senderName.toLowerCase().includes(messageSearchQuery.toLowerCase())
      )
    : allConversationMessages

  const emojiCategories = {
    'Smileys & People': [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇',
      '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝',
      '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄',
      '😬', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭',
      '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈',
      '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸',
      '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
    ],
    'Gestures & Body': [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
      '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏',
      '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶',
      '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋'
    ],
    'Hearts & Emotions': [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹',
      '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️',
      '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎',
      '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚',
      '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐'
    ],
    'Animals & Nature': [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷',
      '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥',
      '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌',
      '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎',
      '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋',
      '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫',
      '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌',
      '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🪶', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢',
      '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'
    ],
    'Food & Drink': [
      '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑',
      '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽',
      '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚',
      '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕',
      '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜',
      '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮',
      '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫',
      '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤',
      '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊'
    ],
    'Activities & Sports': [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸',
      '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋',
      '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸',
      '🤺', '🤾', '🏌️', '🏇', '🧘', '🏊', '🏄', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇',
      '🥈', '🥉', '🏅', '🎖️', '🎗️', '🏵️', '🎫', '🎟️', '🎪', '🤹', '🎭', '🩰', '🎨',
      '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻'
    ],
    'Travel & Places': [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛',
      '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘',
      '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆',
      '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶',
      '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🪝', '⛽', '🚧', '🚦', '🚥', '🚏',
      '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️',
      '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🛖', '🏠', '🏡', '🏘️', '🏚️',
      '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒',
      '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩️', '🛤️', '🛣️', '🗾', '🎑', '🏞️', '🌅',
      '🌄', '🌠', '🎇', '🎆', '🌇', '🌆', '🏙️', '🌃', '🌌', '🌉', '🌁'
    ],
    'Objects & Symbols': [
      '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💾', '💿',
      '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺',
      '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋',
      '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙',
      '💰', '💳', '🪪', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️',
      '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️',
      '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭',
      '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹',
      '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🪥', '🪒', '🧼', '🪣', '🧴', '🧽',
      '🧯', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🖼️', '🪞', '🪟', '🛍️', '🎁',
      '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩',
      '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '🪧', '📪', '📫', '📬', '📭', '📮',
      '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅',
      '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔',
      '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐',
      '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍',
      '🔎', '🔏', '🔐', '🔒', '🔓'
    ],
    'Symbols': [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '❣️', '💕', '💞', '💓',
      '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎',
      '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑',
      '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺',
      '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️',
      '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️',
      '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️',
      '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️',
      '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🈳',
      '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧️', '🚻', '🚮', '🎦', '📶',
      '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣',
      '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣',
      '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼',
      '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️',
      '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️',
      '♾️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝',
      '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤',
      '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️',
      '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉',
      '🔊', '🔔', '🔕', '📣', '📢', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏',
      '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚',
      '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'
    ],
    'Flags': [
      '🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇺🇳', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿',
      '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿',
      '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦',
      '🇧🇼', '🇧🇷', '🇮🇴', '🇻🇬', '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇮🇨',
      '🇨🇻', '🇧🇶', '🇰🇾', '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇳', '🇨🇽', '🇨🇨', '🇨🇴', '🇰🇲', '🇨🇬',
      '🇨🇩', '🇨🇰', '🇨🇷', '🇨🇮', '🇭🇷', '🇨🇺', '🇨🇼', '🇨🇾', '🇨🇿', '🇩🇰', '🇩🇯', '🇩🇲',
      '🇩🇴', '🇪🇨', '🇪🇬', '🇸🇻', '🇬🇶', '🇪🇷', '🇪🇪', '🇸🇿', '🇪🇹', '🇪🇺', '🇫🇰', '🇫🇴',
      '🇫🇯', '🇫🇮', '🇫🇷', '🇬🇫', '🇵🇫', '🇹🇫', '🇬🇦', '🇬🇲', '🇬🇪', '🇩🇪', '🇬🇭', '🇬🇮',
      '🇬🇷', '🇬🇱', '🇬🇩', '🇬🇵', '🇬🇺', '🇬🇹', '🇬🇬', '🇬🇳', '🇬🇼', '🇬🇾', '🇭🇹', '🇭🇳',
      '🇭🇰', '🇭🇺', '🇮🇸', '🇮🇳', '🇮🇩', '🇮🇷', '🇮🇶', '🇮🇪', '🇮🇲', '🇮🇱', '🇮🇹', '🇯🇲',
      '🇯🇵', '🇯🇪', '🇯🇴', '🇰🇿', '🇰🇪', '🇰🇮', '🇽🇰', '🇰🇼', '🇰🇬', '🇱🇦', '🇱🇻', '🇱🇧',
      '🇱🇸', '🇱🇷', '🇱🇾', '🇱🇮', '🇱🇹', '🇱🇺', '🇲🇴', '🇲🇬', '🇲🇼', '🇲🇾', '🇲🇻', '🇲🇱',
      '🇲🇹', '🇲🇭', '🇲🇶', '🇲🇷', '🇲🇺', '🇾🇹', '🇲🇽', '🇫🇲', '🇲🇩', '🇲🇨', '🇲🇳', '🇲🇪',
      '🇲🇸', '🇲🇦', '🇲🇿', '🇲🇲', '🇳🇦', '🇳🇷', '🇳🇵', '🇳🇱', '🇳🇨', '🇳🇿', '🇳🇮', '🇳🇪',
      '🇳🇬', '🇳🇺', '🇳🇫', '🇰🇵', '🇲🇰', '🇲🇵', '🇳🇴', '🇴🇲', '🇵🇰', '🇵🇼', '🇵🇸', '🇵🇦',
      '🇵🇬', '🇵🇾', '🇵🇪', '🇵🇭', '🇵🇳', '🇵🇱', '🇵🇹', '🇵🇷', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇺',
      '🇷🇼', '🇼🇸', '🇸🇲', '🇸🇹', '🇸🇦', '🇸🇳', '🇷🇸', '🇸🇨', '🇸🇱', '🇸🇬', '🇸🇽', '🇸🇰',
      '🇸🇮', '🇬🇸', '🇸🇧', '🇸🇴', '🇿🇦', '🇰🇷', '🇸🇸', '🇪🇸', '🇱🇰', '🇧🇱', '🇸🇭', '🇰🇳',
      '🇱🇨', '🇵🇲', '🇻🇨', '🇸🇩', '🇸🇷', '🇸🇪', '🇨🇭', '🇸🇾', '🇹🇼', '🇹🇯', '🇹🇿', '🇹🇭',
      '🇹🇱', '🇹🇬', '🇹🇰', '🇹🇴', '🇹🇹', '🇹🇳', '🇹🇷', '🇹🇲', '🇹🇨', '🇹🇻', '🇻🇮', '🇺🇬',
      '🇺🇦', '🇦🇪', '🇬🇧', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁷󠁬󠁳󠁿', '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇺',
      '🇻🇦', '🇻🇪', '🇻🇳', '🇼🇫', '🇪🇭', '🇾🇪', '🇿🇲', '🇿🇼'
    ]
  }

  const [emojiPickerSearch, setEmojiPickerSearch] = useState('')
  const [emojiCategory, setEmojiCategory] = useState<keyof typeof emojiCategories>('Smileys & People')

  const filteredConversations = (conversations || [])
    .filter(conv => {
      const matchesStatus = statusFilter === 'all' || conv.status === statusFilter
      const matchesSearch = !searchQuery || 
        conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.serviceName && conv.serviceName.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesStatus && matchesSearch
    })
    .sort((a, b) => b.lastMessageTime - a.lastMessageTime)

  const handleStartNewChat = () => {
    if (!newChatForm.recipientId || !newChatForm.initialMessage) {
      toast.error('Please fill in all required fields')
      return
    }

    const recipient = newChatForm.recipientType === 'provider' 
      ? services.find(s => s.providerAddress === newChatForm.recipientId)
      : agents.find(a => a.address === newChatForm.recipientId)

    if (!recipient) {
      toast.error('Recipient not found')
      return
    }

    const conversationId = crypto.randomUUID()
    const service = newChatForm.serviceId 
      ? services.find(s => s.id === newChatForm.serviceId)
      : undefined

    const newConversation: ChatConversation = {
      id: conversationId,
      participantType: newChatForm.recipientType,
      participantId: newChatForm.recipientId,
      participantName: newChatForm.recipientType === 'provider' 
        ? (recipient as Service).provider 
        : (recipient as Agent).name,
      participantAddress: newChatForm.recipientId,
      serviceId: service?.id,
      serviceName: service?.name,
      lastMessage: newChatForm.initialMessage,
      lastMessageTime: Date.now(),
      unreadCount: 0,
      status: 'active',
      topic: newChatForm.topic
    }

    const firstMessage: ChatMessage = {
      id: crypto.randomUUID(),
      conversationId,
      senderId: userAddress,
      senderName: userType === 'agent' 
        ? agents.find(a => a.address === userAddress)?.name || 'You'
        : 'You',
      senderType: userType,
      message: newChatForm.initialMessage,
      timestamp: Date.now()
    }

    setConversations((current = []) => [newConversation, ...current])
    setMessages((current = []) => [...current, firstMessage])
    setActiveConversation(conversationId)
    setIsNewChatOpen(false)
    setNewChatForm({
      recipientType: 'provider',
      recipientId: '',
      serviceId: '',
      topic: 'general-inquiry',
      initialMessage: ''
    })
    toast.success('New conversation started')
  }

  const processFiles = (files: File[]) => {
    if (files.length === 0) return

    const maxSize = 10 * 1024 * 1024
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const newPreviews = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type
    }))

    setAttachments(prev => [...prev, ...validFiles])
    setPreviewUrls(prev => [...prev, ...newPreviews])
    toast.success(`Added ${validFiles.length} file(s)`)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFiles(files)
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => {
      const preview = prev[index]
      if (preview) {
        URL.revokeObjectURL(preview.url)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)

      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)

      toast.success('Recording started')
    } catch (error) {
      toast.error('Failed to access microphone')
      console.error('Recording error:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const cancelRecording = () => {
    stopRecording()
    setAudioBlob(null)
    setRecordingDuration(0)
    toast.info('Recording cancelled')
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((current = []) =>
      current.map(msg => {
        if (msg.id !== messageId) return msg
        
        const reactions = msg.reactions || []
        const existingReaction = reactions.find(r => r.userId === userAddress && r.emoji === emoji)
        
        if (existingReaction) {
          return {
            ...msg,
            reactions: reactions.filter(r => !(r.userId === userAddress && r.emoji === emoji))
          }
        } else {
          return {
            ...msg,
            reactions: [
              ...reactions.filter(r => r.userId !== userAddress || r.emoji !== emoji),
              {
                emoji,
                userId: userAddress,
                userName: userType === 'agent'
                  ? agents.find(a => a.address === userAddress)?.name || 'You'
                  : 'You',
                timestamp: Date.now()
              }
            ]
          }
        }
      })
    )
  }

  const handleEditMessage = (message: ChatMessage) => {
    setEditingMessage(message)
    setEditText(message.message)
  }

  const saveEditMessage = () => {
    if (!editingMessage || !editText.trim()) return

    setMessages((current = []) =>
      current.map(msg =>
        msg.id === editingMessage.id
          ? { ...msg, message: editText.trim(), edited: true, editedAt: Date.now() }
          : msg
      )
    )

    setEditingMessage(null)
    setEditText('')
    toast.success('Message updated')
  }

  const handleDeleteMessage = (messageId: string) => {
    setMessages((current = []) =>
      current.map(msg =>
        msg.id === messageId
          ? { ...msg, deleted: true, message: 'This message was deleted' }
          : msg
      )
    )
    toast.success('Message deleted')
  }

  const handleMarkAsRead = (messageId: string) => {
    setMessages((current = []) =>
      current.map(msg => {
        if (msg.id === messageId && msg.senderId !== userAddress) {
          const readBy = msg.readBy || []
          if (!readBy.includes(userAddress)) {
            return { ...msg, readBy: [...readBy, userAddress] }
          }
        }
        return msg
      })
    )
  }

  useEffect(() => {
    if (activeConversation) {
      conversationMessages.forEach(msg => {
        if (msg.senderId !== userAddress) {
          handleMarkAsRead(msg.id)
        }
      })
    }
  }, [activeConversation, conversationMessages.length])

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />
    if (type.includes('pdf')) return <FilePdf className="w-5 h-5" />
    if (type.includes('code') || type.includes('javascript') || type.includes('typescript') || type.includes('json')) {
      return <FileCode className="w-5 h-5" />
    }
    return <FileText className="w-5 h-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleSendMessage = () => {
    if ((!newMessage.trim() && attachments.length === 0 && !audioBlob) || !activeConversation) return

    if (editingMessage) {
      saveEditMessage()
      return
    }

    let chatAttachments: ChatAttachment[] = previewUrls.map((preview, index) => ({
      id: crypto.randomUUID(),
      type: preview.type.startsWith('image/') ? 'image' : 'document',
      name: preview.file.name,
      url: preview.url,
      size: preview.file.size,
      mimeType: preview.type
    }))

    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob)
      chatAttachments.push({
        id: crypto.randomUUID(),
        type: 'voice',
        name: `voice-${Date.now()}.webm`,
        url: audioUrl,
        size: audioBlob.size,
        duration: recordingDuration,
        mimeType: 'audio/webm'
      })
    }

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      conversationId: activeConversation,
      senderId: userAddress,
      senderName: userType === 'agent'
        ? agents.find(a => a.address === userAddress)?.name || 'You'
        : 'You',
      senderType: userType,
      message: newMessage.trim() || (audioBlob ? '🎤 Voice message' : attachments.length > 0 ? `📎 Sent ${attachments.length} file(s)` : ''),
      timestamp: Date.now(),
      attachments: chatAttachments.length > 0 ? chatAttachments : undefined,
      replyTo: replyingTo?.id,
      offerDetails: negotiationOffer ? {
        ...negotiationOffer,
        offerId: crypto.randomUUID(),
        status: 'pending',
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
      } as NegotiationOffer : undefined
    }

    setMessages((current = []) => [...current, message])
    setConversations((current = []) =>
      current.map(conv =>
        conv.id === activeConversation
          ? { 
              ...conv, 
              lastMessage: negotiationOffer 
                ? `💰 Price offer: ${negotiationOffer.offeredPrice} MNEE` 
                : audioBlob
                  ? '🎤 Voice message'
                  : attachments.length > 0 
                    ? `📎 ${attachments.length} file(s)` 
                    : newMessage.trim(),
              lastMessageTime: Date.now() 
            }
          : conv
      )
    )
    
    setNewMessage('')
    setAttachments([])
    setPreviewUrls([])
    setNegotiationOffer(null)
    setAudioBlob(null)
    setRecordingDuration(0)
    setReplyingTo(null)
    toast.success('Message sent')
  }

  const handleAcceptOffer = (message: ChatMessage) => {
    if (!message.offerDetails) return

    const acceptanceMessage: ChatMessage = {
      id: crypto.randomUUID(),
      conversationId: message.conversationId,
      senderId: userAddress,
      senderName: 'You',
      senderType: userType,
      message: `✅ Offer accepted! Proceeding with ${message.offerDetails.offeredPrice} MNEE for ${message.offerDetails.serviceName}`,
      timestamp: Date.now(),
      isSystem: true
    }

    setMessages((current = []) => 
      current.map(m => 
        m.id === message.id && m.offerDetails
          ? { ...m, offerDetails: { ...m.offerDetails, status: 'accepted' as const } }
          : m
      ).concat(acceptanceMessage)
    )

    toast.success('Offer accepted!')
  }

  const handleRejectOffer = (message: ChatMessage) => {
    if (!message.offerDetails) return

    const rejectionMessage: ChatMessage = {
      id: crypto.randomUUID(),
      conversationId: message.conversationId,
      senderId: userAddress,
      senderName: 'You',
      senderType: userType,
      message: `❌ Offer declined`,
      timestamp: Date.now(),
      isSystem: true
    }

    setMessages((current = []) => 
      current.map(m => 
        m.id === message.id && m.offerDetails
          ? { ...m, offerDetails: { ...m.offerDetails, status: 'rejected' as const } }
          : m
      ).concat(rejectionMessage)
    )

    toast.info('Offer declined')
  }

  const handleResolveConversation = (conversationId: string) => {
    setConversations((current = []) =>
      current.map(conv =>
        conv.id === conversationId ? { ...conv, status: 'resolved' as const } : conv
      )
    )
    toast.success('Conversation marked as resolved')
  }

  const handleArchiveConversation = (conversationId: string) => {
    setConversations((current = []) =>
      current.map(conv =>
        conv.id === conversationId ? { ...conv, status: 'archived' as const } : conv
      )
    )
    toast.success('Conversation archived')
  }

  const getTopicLabel = (topic: ChatTopic) => {
    const labels: Record<ChatTopic, string> = {
      'general-inquiry': 'General Inquiry',
      'technical-support': 'Technical Support',
      'pricing-negotiation': 'Pricing Negotiation',
      'custom-service': 'Custom Service',
      'issue-resolution': 'Issue Resolution',
      'feedback': 'Feedback'
    }
    return labels[topic]
  }

  const getTopicColor = (topic: ChatTopic) => {
    const colors: Record<ChatTopic, string> = {
      'general-inquiry': 'bg-blue-500/10 text-blue-500',
      'technical-support': 'bg-orange-500/10 text-orange-500',
      'pricing-negotiation': 'bg-green-500/10 text-green-500',
      'custom-service': 'bg-purple-500/10 text-purple-500',
      'issue-resolution': 'bg-red-500/10 text-red-500',
      'feedback': 'bg-cyan-500/10 text-cyan-500'
    }
    return colors[topic]
  }

  const uniqueProviders = Array.from(new Set(services.map(s => s.providerAddress)))
    .map(address => {
      const service = services.find(s => s.providerAddress === address)
      return {
        address,
        name: service?.provider || 'Unknown Provider'
      }
    })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ChatCircle className="w-5 h-5 text-primary" />
                Conversations
              </CardTitle>
              <CardDescription>
                {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                  <DialogDescription>
                    Connect with service providers or agents
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Recipient Type</Label>
                    <Select
                      value={newChatForm.recipientType}
                      onValueChange={(value: 'provider' | 'agent') => 
                        setNewChatForm({ ...newChatForm, recipientType: value, recipientId: '' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="provider">Service Provider</SelectItem>
                        <SelectItem value="agent">AI Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select {newChatForm.recipientType === 'provider' ? 'Provider' : 'Agent'}</Label>
                    <Select
                      value={newChatForm.recipientId}
                      onValueChange={(value) => 
                        setNewChatForm({ ...newChatForm, recipientId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Choose a ${newChatForm.recipientType}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {newChatForm.recipientType === 'provider' 
                          ? uniqueProviders.map(provider => (
                              <SelectItem key={provider.address} value={provider.address}>
                                {provider.name}
                              </SelectItem>
                            ))
                          : agents.map(agent => (
                              <SelectItem key={agent.address} value={agent.address}>
                                {agent.name}
                              </SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                  </div>

                  {newChatForm.recipientType === 'provider' && (
                    <div className="space-y-2">
                      <Label>Related Service (Optional)</Label>
                      <Select
                        value={newChatForm.serviceId}
                        onValueChange={(value) => 
                          setNewChatForm({ ...newChatForm, serviceId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services
                            .filter(s => s.providerAddress === newChatForm.recipientId)
                            .map(service => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Topic</Label>
                    <Select
                      value={newChatForm.topic}
                      onValueChange={(value: ChatTopic) => 
                        setNewChatForm({ ...newChatForm, topic: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general-inquiry">General Inquiry</SelectItem>
                        <SelectItem value="technical-support">Technical Support</SelectItem>
                        <SelectItem value="pricing-negotiation">Pricing Negotiation</SelectItem>
                        <SelectItem value="custom-service">Custom Service</SelectItem>
                        <SelectItem value="issue-resolution">Issue Resolution</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Initial Message</Label>
                    <Textarea
                      placeholder="Type your message..."
                      value={newChatForm.initialMessage}
                      onChange={(e) => 
                        setNewChatForm({ ...newChatForm, initialMessage: e.target.value })
                      }
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleStartNewChat}
                      className="flex-1"
                    >
                      Start Conversation
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsNewChatOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <div className="px-6 pb-3 space-y-3">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-2 pb-4">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ChatCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm mt-1">Start a new chat to connect</p>
              </div>
            ) : (
              filteredConversations.map(conversation => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setActiveConversation(conversation.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeConversation === conversation.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-card hover:bg-accent/50 border border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      conversation.participantType === 'provider' 
                        ? 'bg-accent/20 text-accent' 
                        : 'bg-primary/20 text-primary'
                    }`}>
                      {conversation.participantType === 'provider' ? (
                        <Crown className="w-5 h-5" />
                      ) : (
                        <Robot className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-sm truncate">
                          {conversation.participantName}
                        </span>
                        {conversation.status === 'resolved' && (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      {conversation.serviceName && (
                        <p className="text-xs text-muted-foreground mb-1 truncate">
                          {conversation.serviceName}
                        </p>
                      )}
                      <Badge variant="outline" className={`text-xs mb-2 ${getTopicColor(conversation.topic)}`}>
                        {getTopicLabel(conversation.topic)}
                      </Badge>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conversation.lastMessageTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      <Card className="lg:col-span-2 flex flex-col">
        {activeConversationData ? (
          <>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    activeConversationData.participantType === 'provider' 
                      ? 'bg-accent/20 text-accent' 
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {activeConversationData.participantType === 'provider' ? (
                      <Crown className="w-6 h-6" />
                    ) : (
                      <Robot className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {activeConversationData.participantName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      {activeConversationData.serviceName && (
                        <>
                          <span>{activeConversationData.serviceName}</span>
                          <span>•</span>
                        </>
                      )}
                      <Badge variant="outline" className={`text-xs ${getTopicColor(activeConversationData.topic)}`}>
                        {getTopicLabel(activeConversationData.topic)}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeConversationData.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveConversation(activeConversationData.id)}
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Resolve
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleArchiveConversation(activeConversationData.id)}
                    className="gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={messageSearchQuery}
                  onChange={(e) => setMessageSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </CardHeader>

            <Separator />

            <div 
              ref={dropZoneRef}
              className="relative flex-1 flex flex-col"
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <AnimatePresence>
                {isDragging && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm border-4 border-dashed border-primary rounded-lg flex items-center justify-center"
                  >
                    <div className="text-center">
                      <Paperclip className="w-16 h-16 mx-auto mb-4 text-primary animate-bounce" />
                      <h3 className="text-xl font-bold mb-2">Drop files here</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload images, documents, or code files
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Maximum file size: 10MB
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                {conversationMessages.map((message) => {
                  const isSentByUser = message.senderId === userAddress
                  const replyToMessage = message.replyTo ? messages?.find(m => m.id === message.replyTo) : null
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isSentByUser ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div className={`max-w-[80%] ${isSentByUser ? 'items-end' : 'items-start'} space-y-1`}>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {!isSentByUser && (
                            <span className="font-medium">{message.senderName}</span>
                          )}
                          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                          {message.edited && (
                            <span className="italic">(edited)</span>
                          )}
                          {message.readBy && message.readBy.length > 0 && isSentByUser && (
                            <Checks className="w-3 h-3 text-accent" />
                          )}
                        </div>
                        
                        <div className="relative">
                          <div 
                            className={`px-4 py-3 rounded-lg ${
                              message.isSystem
                                ? 'bg-muted/50 border border-border'
                                : message.deleted
                                  ? 'bg-muted/30 border border-border italic opacity-60'
                                  : isSentByUser 
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                            }`}
                          >
                            {replyToMessage && (
                              <div className={`mb-2 p-2 rounded text-xs border-l-2 ${
                                isSentByUser
                                  ? 'bg-primary-foreground/10 border-primary-foreground/30'
                                  : 'bg-background/50 border-border'
                              }`}>
                                <div className="flex items-center gap-1 mb-1 opacity-70">
                                  <ArrowBendUpLeft className="w-3 h-3" />
                                  <span>{replyToMessage.senderName}</span>
                                </div>
                                <p className="line-clamp-2 opacity-80">{replyToMessage.message}</p>
                              </div>
                            )}
                            
                            {message.message && (
                              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                            )}
                            
                            {message.attachments && message.attachments.length > 0 && (
                              <div className={`space-y-2 ${message.message ? 'mt-3' : ''}`}>
                                {message.attachments.map((attachment) => (
                                  <div 
                                    key={attachment.id}
                                    className={`rounded-lg overflow-hidden border ${
                                      isSentByUser 
                                        ? 'border-primary-foreground/20 bg-primary-foreground/10' 
                                        : 'border-border bg-background/50'
                                    }`}
                                  >
                                    {attachment.type === 'image' ? (
                                      <div className="space-y-2">
                                        <img 
                                          src={attachment.url} 
                                          alt={attachment.name}
                                          className="w-full max-w-sm rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                          onClick={() => setLightboxImage(attachment.url)}
                                        />
                                        <div className="px-3 pb-2 flex items-center justify-between text-xs">
                                          <span className="truncate">{attachment.name}</span>
                                          {attachment.size && (
                                            <span className="opacity-70">{formatFileSize(attachment.size)}</span>
                                          )}
                                        </div>
                                      </div>
                                    ) : attachment.type === 'voice' ? (
                                      <div className="p-3 flex items-center gap-3">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            if (playingAudio === attachment.id) {
                                              audioRef.current?.pause()
                                              setPlayingAudio(null)
                                            } else {
                                              if (audioRef.current) {
                                                audioRef.current.src = attachment.url
                                                audioRef.current.play()
                                                setPlayingAudio(attachment.id)
                                              }
                                            }
                                          }}
                                          className="h-8 w-8 p-0"
                                        >
                                          {playingAudio === attachment.id ? (
                                            <Pause className="w-4 h-4" />
                                          ) : (
                                            <Play className="w-4 h-4" />
                                          )}
                                        </Button>
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">Voice Message</p>
                                          {attachment.duration && (
                                            <p className="text-xs opacity-70">{formatDuration(attachment.duration)}</p>
                                          )}
                                        </div>
                                        <Microphone className="w-5 h-5 opacity-50" />
                                      </div>
                                    ) : (
                                      <div className="p-3 flex items-center gap-3">
                                        <div className={`p-2 rounded ${
                                          isSentByUser 
                                            ? 'bg-primary-foreground/20' 
                                            : 'bg-muted'
                                        }`}>
                                          {getFileIcon(attachment.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">{attachment.name}</p>
                                          {attachment.size && (
                                            <p className="text-xs opacity-70">{formatFileSize(attachment.size)}</p>
                                          )}
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            const link = document.createElement('a')
                                            link.href = attachment.url
                                            link.download = attachment.name
                                            link.click()
                                          }}
                                          className="h-8 w-8 p-0"
                                        >
                                          <DownloadSimple className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {message.offerDetails && (
                              <div className="mt-3 pt-3 border-t border-current/20">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span>Service:</span>
                                    <span className="font-semibold">{message.offerDetails.serviceName}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span>Original Price:</span>
                                    <span className="line-through opacity-70">
                                      {message.offerDetails.originalPrice} MNEE
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Offered Price:</span>
                                    <span className="text-lg font-bold">
                                      {message.offerDetails.offeredPrice} MNEE
                                    </span>
                                  </div>
                                  {message.offerDetails.customTerms && (
                                    <div className="pt-2 text-xs">
                                      <p className="font-medium mb-1">Custom Terms:</p>
                                      <p className="opacity-90">{message.offerDetails.customTerms}</p>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 pt-2">
                                    <Badge 
                                      variant="outline"
                                      className={
                                        message.offerDetails.status === 'accepted' 
                                          ? 'bg-green-500/10 text-green-500'
                                          : message.offerDetails.status === 'rejected'
                                          ? 'bg-red-500/10 text-red-500'
                                          : message.offerDetails.status === 'expired'
                                          ? 'bg-gray-500/10 text-gray-500'
                                          : 'bg-yellow-500/10 text-yellow-500'
                                      }
                                    >
                                      {message.offerDetails.status.toUpperCase()}
                                    </Badge>
                                    {message.offerDetails.status === 'pending' && !isSentByUser && (
                                      <div className="flex gap-2 ml-auto">
                                        <Button
                                          size="sm"
                                          onClick={() => handleAcceptOffer(message)}
                                          className="h-7 text-xs"
                                        >
                                          Accept
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleRejectOffer(message)}
                                          className="h-7 text-xs"
                                        >
                                          Decline
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs opacity-70 pt-1">
                                    Expires: {new Date(message.offerDetails.expiresAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {!message.deleted && (
                            <>
                              {message.reactions && message.reactions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {Object.entries(
                                    message.reactions.reduce((acc, r) => {
                                      acc[r.emoji] = (acc[r.emoji] || 0) + 1
                                      return acc
                                    }, {} as Record<string, number>)
                                  ).map(([emoji, count]) => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReaction(message.id, emoji)}
                                      className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 transition-colors ${
                                        message.reactions?.some(r => r.userId === userAddress && r.emoji === emoji)
                                          ? 'bg-accent/20 border border-accent'
                                          : 'bg-muted/50 border border-border hover:bg-muted'
                                      }`}
                                    >
                                      <span>{emoji}</span>
                                      <span className="text-xs font-medium">{count}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                              
                              <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                                isSentByUser ? 'justify-end' : 'justify-start'
                              }`}>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2"
                                    >
                                      <Smiley className="w-3 h-3" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[380px] p-0" align="start">
                                    <div className="flex flex-col max-h-[420px]">
                                      <div className="p-3 border-b border-border space-y-2">
                                        <Input
                                          placeholder="Search emojis..."
                                          value={emojiPickerSearch}
                                          onChange={(e) => setEmojiPickerSearch(e.target.value)}
                                          className="h-8 text-sm"
                                        />
                                        <div className="flex gap-1 overflow-x-auto pb-1">
                                          {(Object.keys(emojiCategories) as Array<keyof typeof emojiCategories>).map((cat) => (
                                            <button
                                              key={cat}
                                              onClick={() => {
                                                setEmojiCategory(cat)
                                                setEmojiPickerSearch('')
                                              }}
                                              className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                                                emojiCategory === cat
                                                  ? 'bg-primary text-primary-foreground'
                                                  : 'bg-muted hover:bg-muted/80'
                                              }`}
                                            >
                                              {cat.split(' ')[0]}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <ScrollArea className="flex-1 p-3">
                                        <div className="grid grid-cols-8 gap-1">
                                          {(emojiPickerSearch
                                            ? Object.values(emojiCategories)
                                                .flat()
                                                .filter(emoji => emoji.toLowerCase().includes(emojiPickerSearch.toLowerCase()))
                                            : emojiCategories[emojiCategory]
                                          ).map((emoji, idx) => (
                                            <button
                                              key={`${emoji}-${idx}`}
                                              onClick={() => {
                                                handleReaction(message.id, emoji)
                                                setEmojiPickerSearch('')
                                              }}
                                              className="text-2xl hover:scale-125 transition-transform p-2 hover:bg-muted rounded"
                                              title={emoji}
                                            >
                                              {emoji}
                                            </button>
                                          ))}
                                        </div>
                                        {emojiPickerSearch && 
                                          Object.values(emojiCategories).flat().filter(emoji => 
                                            emoji.toLowerCase().includes(emojiPickerSearch.toLowerCase())
                                          ).length === 0 && (
                                          <div className="text-center py-8 text-muted-foreground text-sm">
                                            No emojis found
                                          </div>
                                        )}
                                      </ScrollArea>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setReplyingTo(message)}
                                  className="h-6 px-2"
                                >
                                  <ArrowBendUpLeft className="w-3 h-3" />
                                </Button>
                                
                                {isSentByUser && !message.isSystem && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 px-2"
                                      >
                                        <DotsThree className="w-3 h-3" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-32 p-1">
                                      <div className="flex flex-col">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleEditMessage(message)}
                                          className="justify-start gap-2 h-8"
                                        >
                                          <PencilSimple className="w-3 h-3" />
                                          Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDeleteMessage(message.id)}
                                          className="justify-start gap-2 h-8 text-destructive hover:text-destructive"
                                        >
                                          <Trash className="w-3 h-3" />
                                          Delete
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            </div>

            <Separator />

            <CardContent className="pt-4 pb-4 space-y-3">
              {previewUrls.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-muted/50 border border-border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Attachments ({previewUrls.length})</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        previewUrls.forEach(preview => URL.revokeObjectURL(preview.url))
                        setAttachments([])
                        setPreviewUrls([])
                      }}
                      className="h-6 text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {previewUrls.map((preview, index) => (
                      <div 
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-border bg-background"
                      >
                        {preview.type.startsWith('image/') ? (
                          <div className="relative aspect-video">
                            <img 
                              src={preview.url} 
                              alt={preview.file.name}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeAttachment(index)}
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="p-3 flex items-center gap-2">
                            <div className="p-2 rounded bg-muted">
                              {getFileIcon(preview.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{preview.file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(preview.file.size)}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeAttachment(index)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {negotiationOffer && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-accent/10 border border-accent/20 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CurrencyDollar className="w-5 h-5 text-accent" />
                      <span className="font-semibold text-sm">Price Negotiation</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setNegotiationOffer(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Service</Label>
                      <Select
                        value={negotiationOffer.serviceId}
                        onValueChange={(value) => {
                          const service = services.find(s => s.id === value)
                          if (service) {
                            setNegotiationOffer({
                              ...negotiationOffer,
                              serviceId: value,
                              serviceName: service.name,
                              originalPrice: service.price
                            })
                          }
                        }}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services
                            .filter(s => s.providerAddress === activeConversationData.participantAddress)
                            .map(service => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Your Offer (MNEE)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={negotiationOffer.offeredPrice || ''}
                        onChange={(e) => 
                          setNegotiationOffer({
                            ...negotiationOffer,
                            offeredPrice: parseFloat(e.target.value)
                          })
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Custom Terms (Optional)</Label>
                    <Textarea
                      placeholder="Add any special requirements or terms..."
                      value={negotiationOffer.customTerms || ''}
                      onChange={(e) => 
                        setNegotiationOffer({
                          ...negotiationOffer,
                          customTerms: e.target.value
                        })
                      }
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                {replyingTo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-2 bg-muted/50 border border-border rounded-lg flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <ArrowBendUpLeft className="w-3 h-3" />
                        <span>Replying to {replyingTo.senderName}</span>
                      </div>
                      <p className="text-sm line-clamp-2">{replyingTo.message}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyingTo(null)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </motion.div>
                )}

                {editingMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-2 bg-accent/10 border border-accent/20 rounded-lg flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <PencilSimple className="w-3 h-3" />
                        <span>Editing message</span>
                      </div>
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="text-sm min-h-[60px]"
                        autoFocus
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingMessage(null)
                        setEditText('')
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </motion.div>
                )}

                {audioBlob && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-muted/50 border border-border rounded-lg flex items-center gap-3"
                  >
                    <Microphone className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Voice Recording</p>
                      <p className="text-xs text-muted-foreground">{formatDuration(recordingDuration)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelRecording}
                      className="h-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}

                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt,.json,.js,.ts,.tsx,.jsx,.css,.html"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {activeConversationData.participantType === 'provider' && !editingMessage && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setNegotiationOffer(negotiationOffer ? null : {})}
                      className="gap-2"
                    >
                      <CurrencyDollar className="w-4 h-4" />
                      {negotiationOffer ? 'Cancel' : 'Negotiate'}
                    </Button>
                  )}
                  {!editingMessage && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2"
                      >
                        <Paperclip className="w-4 h-4" />
                        <span className="hidden sm:inline">Attach</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`gap-2 ${isRecording ? 'bg-destructive text-destructive-foreground' : ''}`}
                      >
                        {isRecording ? (
                          <>
                            <Stop className="w-4 h-4" />
                            <span className="hidden sm:inline">{formatDuration(recordingDuration)}</span>
                          </>
                        ) : (
                          <>
                            <Microphone className="w-4 h-4" />
                            <span className="hidden sm:inline">Voice</span>
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  <div className="flex-1 flex gap-2">
                    {editingMessage ? (
                      <>
                        <Button
                          onClick={saveEditMessage}
                          className="flex-1"
                          disabled={!editText.trim()}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingMessage(null)
                            setEditText('')
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 relative">
                          <Input
                            placeholder={isRecording ? "Recording voice message..." : "Type your message..."}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                            disabled={isRecording}
                            className="pr-10"
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                                disabled={isRecording}
                              >
                                <Smiley className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[380px] p-0" align="end">
                              <div className="flex flex-col max-h-[420px]">
                                <div className="p-3 border-b border-border space-y-2">
                                  <Input
                                    placeholder="Search emojis..."
                                    value={emojiPickerSearch}
                                    onChange={(e) => setEmojiPickerSearch(e.target.value)}
                                    className="h-8 text-sm"
                                  />
                                  <div className="flex gap-1 overflow-x-auto pb-1">
                                    {(Object.keys(emojiCategories) as Array<keyof typeof emojiCategories>).map((cat) => (
                                      <button
                                        key={cat}
                                        onClick={() => {
                                          setEmojiCategory(cat)
                                          setEmojiPickerSearch('')
                                        }}
                                        className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                                          emojiCategory === cat
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted hover:bg-muted/80'
                                        }`}
                                      >
                                        {cat.split(' ')[0]}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <ScrollArea className="flex-1 p-3">
                                  <div className="grid grid-cols-8 gap-1">
                                    {(emojiPickerSearch
                                      ? Object.values(emojiCategories)
                                          .flat()
                                          .filter(emoji => emoji.toLowerCase().includes(emojiPickerSearch.toLowerCase()))
                                      : emojiCategories[emojiCategory]
                                    ).map((emoji, idx) => (
                                      <button
                                        key={`${emoji}-${idx}`}
                                        onClick={() => {
                                          setNewMessage(prev => prev + emoji)
                                          setEmojiPickerSearch('')
                                        }}
                                        className="text-2xl hover:scale-125 transition-transform p-2 hover:bg-muted rounded"
                                        title={emoji}
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                  {emojiPickerSearch && 
                                    Object.values(emojiCategories).flat().filter(emoji => 
                                      emoji.toLowerCase().includes(emojiPickerSearch.toLowerCase())
                                    ).length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                      No emojis found
                                    </div>
                                  )}
                                </ScrollArea>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <Button onClick={handleSendMessage} className="gap-2" disabled={isRecording}>
                          <PaperPlaneRight className="w-4 h-4" />
                          Send
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {!editingMessage && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 px-1">
                    <Paperclip className="w-3 h-3" />
                    Drag & drop files • Attach images & documents • Record voice • Add emojis
                  </p>
                )}
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <ChatCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a conversation from the list or start a new one
              </p>
              <Button onClick={() => setIsNewChatOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-4xl p-2">
          {lightboxImage && (
            <div className="relative">
              <img
                src={lightboxImage}
                alt="Full size"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = lightboxImage
                  link.download = 'image.png'
                  link.click()
                }}
                className="absolute bottom-4 right-4 gap-2"
              >
                <DownloadSimple className="w-4 h-4" />
                Download
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <audio
        ref={audioRef}
        onEnded={() => setPlayingAudio(null)}
        className="hidden"
      />
    </div>
  )
}
