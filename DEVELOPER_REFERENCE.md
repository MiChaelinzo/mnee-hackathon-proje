# Developer Quick Reference - Enhanced Chat

## Quick Start

The enhanced chat is already integrated. No additional setup needed beyond what's already in the project.

## Component Usage

```tsx
<MarketplaceChat
  services={services || []}
  agents={agents || []}
  userAddress={wallet.address || '0x0'}
  userType={wallet.isConnected ? 'agent' : 'agent'}
/>
```

## Key Functions Reference

### Voice Recording
```typescript
// Start recording
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mediaRecorder = new MediaRecorder(stream)
  // ... recording logic
}

// Stop recording
const stopRecording = () => {
  mediaRecorderRef.current?.stop()
}
```

### Message Reactions
```typescript
// Add or remove reaction
const handleReaction = (messageId: string, emoji: string) => {
  setMessages((current = []) =>
    current.map(msg => {
      if (msg.id !== messageId) return msg
      const reactions = msg.reactions || []
      // Toggle reaction logic
    })
  )
}
```

### Message Editing
```typescript
// Enter edit mode
const handleEditMessage = (message: ChatMessage) => {
  setEditingMessage(message)
  setEditText(message.message)
}

// Save edited message
const saveEditMessage = () => {
  setMessages((current = []) =>
    current.map(msg =>
      msg.id === editingMessage.id
        ? { ...msg, message: editText, edited: true, editedAt: Date.now() }
        : msg
    )
  )
}
```

### File Upload
```typescript
// Process files (click or drop)
const processFiles = (files: File[]) => {
  const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024)
  const previews = validFiles.map(file => ({
    file,
    url: URL.createObjectURL(file),
    type: file.type
  }))
  setAttachments(prev => [...prev, ...validFiles])
  setPreviewUrls(prev => [...prev, ...previews])
}

// Handle drag & drop
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer.files)
  processFiles(files)
}
```

### Message Search
```typescript
// Filter messages
const conversationMessages = messageSearchQuery
  ? allMessages.filter(m => 
      m.message.toLowerCase().includes(messageSearchQuery.toLowerCase())
    )
  : allMessages
```

## State Management Pattern

**CRITICAL**: Always use functional updates with useKV to prevent data loss

```typescript
// ❌ WRONG - Will lose data
setMessages([...messages, newMessage])

// ✅ CORRECT - Always safe
setMessages((current = []) => [...current, newMessage])
```

## Common Patterns

### Adding New Message
```typescript
const message: ChatMessage = {
  id: crypto.randomUUID(),
  conversationId: activeConversation,
  senderId: userAddress,
  senderName: 'You',
  senderType: userType,
  message: newMessage.trim(),
  timestamp: Date.now(),
  attachments: chatAttachments,
  replyTo: replyingTo?.id,
  reactions: []
}

setMessages((current = []) => [...current, message])
```

### Updating Specific Message
```typescript
setMessages((current = []) =>
  current.map(msg =>
    msg.id === targetId
      ? { ...msg, ...updates }
      : msg
  )
)
```

### Filtering Messages
```typescript
const activeMessages = messages?.filter(m => 
  m.conversationId === activeConversation && !m.deleted
) || []
```

## Component Structure

```
MarketplaceChat/
├── Conversation List (left)
│   ├── Search bar
│   ├── Status filter tabs
│   └── Conversation cards
│
└── Active Chat (right)
    ├── Header
    │   ├── Participant info
    │   ├── Actions (Resolve, Archive)
    │   └── Message search
    │
    ├── Drag & Drop Zone
    │   └── Message List
    │       ├── Message bubble
    │       │   ├── Reply indicator
    │       │   ├── Message content
    │       │   ├── Attachments
    │       │   ├── Voice player
    │       │   ├── Reactions
    │       │   └── Action menu
    │       └── ...more messages
    │
    └── Input Area
        ├── Reply banner (conditional)
        ├── Edit mode (conditional)
        ├── Voice preview (conditional)
        ├── Attachment preview (conditional)
        ├── Negotiation form (conditional)
        └── Input controls
            ├── Negotiate button
            ├── Attach button
            ├── Voice button
            ├── Text input
            └── Send button
```

## Important Refs

```typescript
const messagesEndRef = useRef<HTMLDivElement>(null)        // Auto-scroll
const fileInputRef = useRef<HTMLInputElement>(null)        // File picker
const dropZoneRef = useRef<HTMLDivElement>(null)           // Drag zone
const mediaRecorderRef = useRef<MediaRecorder | null>(null) // Voice
const audioRef = useRef<HTMLAudioElement | null>(null)     // Playback
```

## Event Handlers

### Drag & Drop
```typescript
onDragEnter={handleDragEnter}  // Show overlay
onDragLeave={handleDragLeave}  // Hide overlay
onDragOver={handleDragOver}    // Allow drop
onDrop={handleDrop}            // Process files
```

### Keyboard
```typescript
onKeyDown={(e) => 
  e.key === 'Enter' && !e.shiftKey && handleSendMessage()
}
```

## Cleanup Pattern

```typescript
useEffect(() => {
  return () => {
    // Clean up blob URLs
    previewUrls.forEach(preview => URL.revokeObjectURL(preview.url))
    
    // Stop media recording
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    
    // Clear intervals
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
  }
}, [])
```

## Type Safety

```typescript
// Import all types
import type { 
  ChatMessage,
  ChatAttachment,
  MessageReaction,
  ChatConversation,
  NegotiationOffer
} from '@/lib/types'

// Use in state
const [messages, setMessages] = useKV<ChatMessage[]>('chat-messages', [])
```

## File Type Detection

```typescript
const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <ImageIcon />
  if (type.includes('pdf')) return <FilePdf />
  if (type.includes('code')) return <FileCode />
  return <FileText />
}
```

## Utilities

```typescript
// Format file size
const formatFileSize = (bytes: number) => {
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Format duration
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Scroll to bottom
const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}
```

## Debugging Tips

1. **Check browser console** for MediaRecorder errors
2. **Verify useKV persistence** in Application tab
3. **Monitor blob URLs** - should be cleaned up
4. **Check file sizes** before upload
5. **Test in incognito** to verify fresh state

## Performance Tips

1. Use `React.memo()` for message components if needed
2. Lazy load old messages on scroll
3. Debounce search input
4. Optimize image sizes before upload
5. Clean up unused blob URLs immediately

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Voice Recording | ✅ 47+ | ✅ 25+ | ✅ 14.1+ | ✅ 79+ |
| Drag & Drop | ✅ | ✅ | ✅ | ✅ |
| File API | ✅ | ✅ | ✅ | ✅ |
| Web Audio | ✅ | ✅ | ✅ | ✅ |

## Common Issues & Solutions

### Issue: Voice recording not starting
**Solution**: Check microphone permissions, use HTTPS/localhost

### Issue: Files not previewing
**Solution**: Verify file type is supported, check createObjectURL

### Issue: Messages not persisting
**Solution**: Use functional updates `(current = []) => ...`

### Issue: Memory leak with blobs
**Solution**: Call `URL.revokeObjectURL()` in cleanup

### Issue: Drag overlay stuck
**Solution**: Check dropZoneRef is on correct element

## Testing Checklist

- [ ] Voice record and playback
- [ ] Drag & drop multiple files
- [ ] Edit message multiple times
- [ ] Delete message and verify soft delete
- [ ] Add multiple reactions
- [ ] Reply to create thread
- [ ] Search messages
- [ ] Open image in lightbox
- [ ] Download attachments
- [ ] Read receipts appear
- [ ] All animations smooth
- [ ] Mobile responsive

## Resources

- Full docs: `ENHANCED_CHAT_FEATURES.md`
- Feature list: `NEW_FEATURES.md`
- Summary: `ITERATION_17_SUMMARY.md`
- Types: `src/lib/types.ts`
- Component: `src/components/MarketplaceChat.tsx`

---

**Quick tip**: When adding new features, follow the same pattern:
1. Add to types first
2. Create state variables
3. Write handler functions
4. Add to UI conditionally
5. Update with functional pattern
6. Clean up in useEffect
