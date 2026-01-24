// React hooks for state, lifecycle, and DOM reference
import { useEffect, useRef, useState } from 'react'

// Used to read projectId from URL (?projectId=1)
import { useSearchParams } from 'react-router-dom'

// Custom WebSocket hook (connects frontend to backend WebSocket)
import { useWebSocket } from '../hooks/useWebSocket'

// Authentication context to get logged-in user info
import { useAuth } from '../context/AuthContext'

// Icons for UI
import { PaperAirplaneIcon, ChatBubbleLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline'

/* ===========================
   Type Definitions
   =========================== */

// Structure of a chat message
interface ChatMessage {
  id?: number
  content: string
  senderName: string
  senderAvatar?: string
  timestamp: number
  type: 'MESSAGE' | 'SYSTEM' | 'NOTIFICATION'
}

// Structure to track typing users
interface TypingUser {
  name: string
  timestamp: number
}

export default function Chat() {

  /* ===========================
     URL + Auth
     =========================== */

  // Read projectId from URL
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')

  // Logged-in user data
  const { user } = useAuth()

  /* ===========================
     State Management
     =========================== */

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Map used to track who is typing
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map())
  const [isTyping, setIsTyping] = useState(false)

  // Reference to scroll chat to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Timer reference for typing indicator
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // WebSocket connection (project-based)
  const ws = useWebSocket(projectId)

  /* ===========================
     Auto-scroll chat
     =========================== */

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll when new message arrives
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /* ===========================
     Load old messages (REST API)
     =========================== */

  useEffect(() => {
    if (projectId) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/chat/projects/${projectId}/messages`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          )

          const data = await response.json()

          // Convert backend data into frontend format
          setMessages(data.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderName: msg.sender || 'Unknown',
            timestamp: new Date(msg.createdAt).getTime(),
            type: msg.type || 'MESSAGE'
          })))
        } catch (error) {
          console.error('Failed to load messages:', error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchMessages()
    }
  }, [projectId])

  /* ===========================
     Receive messages (WebSocket)
     =========================== */

  useEffect(() => {
    const unsubscribe = ws.onMessage((message: ChatMessage) => {
      // Add new incoming message to chat
      setMessages(prev => [...prev, message])
    })

    // Cleanup listener on unmount
    return unsubscribe
  }, [ws])

  /* ===========================
     Typing indicator (WebSocket)
     =========================== */

  useEffect(() => {
    const unsubscribe = ws.onTyping((indicator: { userName: string; isTyping: boolean }) => {
      if (indicator.isTyping) {
        // Add typing user
        setTypingUsers(prev => new Map(prev).set(indicator.userName, {
          name: indicator.userName,
          timestamp: Date.now()
        }))
      } else {
        // Remove typing user
        setTypingUsers(prev => {
          const updated = new Map(prev)
          updated.delete(indicator.userName)
          return updated
        })
      }
    })

    return unsubscribe
  }, [ws])

  /* ===========================
     Auto-remove typing users
     =========================== */

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => {
        const updated = new Map(prev)
        const now = Date.now()

        // Remove users inactive for 3 seconds
        updated.forEach((value, key) => {
          if (now - value.timestamp > 3000) {
            updated.delete(key)
          }
        })
        return updated
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  /* ===========================
     Handle typing
     =========================== */

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)

    // Notify others that user is typing
    if (!isTyping && user) {
      ws.sendTypingIndicator(user.name || 'User', true)
      setIsTyping(true)
    }

    // Stop typing after 1 second of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (user) {
        ws.sendTypingIndicator(user.name || 'User', false)
      }
      setIsTyping(false)
    }, 1000)
  }

  /* ===========================
     Send message
     =========================== */

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !user) return

    // Send message via WebSocket
    ws.sendMessage(
      messageInput,
      user.name || 'User',
      user.avatarUrl
    )

    // Reset input
    setMessageInput('')
    setIsTyping(false)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  /* ===========================
     UI States
     =========================== */

  if (!projectId) {
    return (
      <div className="card p-8 text-center">
        <ChatBubbleLeftIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-400">Select a project to start chatting</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  /* ===========================
     Render Chat UI
     =========================== */

  const typingList = Array.from(typingUsers.values())

  return (
    <div className="space-y-4 h-[calc(100vh-200px)] flex flex-col">

      <div className="text-2xl font-semibold">Team Chat</div>

      {/* Messages */}
      <div className="card flex-1 p-4 overflow-y-auto space-y-4">

        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="flex gap-3">

              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.senderAvatar ? (
                  <img src={message.senderAvatar} className="w-8 h-8 rounded-full" />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-slate-400" />
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{message.senderName}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="bg-white/5 rounded-lg p-2.5 mt-1 text-sm">
                  {message.content}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typingList.length > 0 && (
          <div className="text-sm text-slate-400">
            {typingList.length === 1
              ? `${typingList[0].name} is typing...`
              : `${typingList.length} people are typing...`}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="card p-4">
        <div className="flex gap-3">
          <input
            value={messageInput}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="input-primary flex-1"
          />
          <button className="btn-primary" type="submit">
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Connection status */}
        <div className="text-xs mt-2">
          {ws.isConnected ? '✓ Connected' : '⚠ Connecting...'}
        </div>
      </form>
    </div>
  )
}
