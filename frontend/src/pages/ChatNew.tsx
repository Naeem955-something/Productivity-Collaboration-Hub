import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useWebSocket } from '../hooks/useWebSocket'
import { useAuth } from '../context/AuthContext'
import { PaperAirplaneIcon, ChatBubbleLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline'

interface ChatMessage {
  id?: number
  content: string
  senderName: string
  senderAvatar?: string
  timestamp: number
  type: 'MESSAGE' | 'SYSTEM' | 'NOTIFICATION'
}

interface TypingUser {
  name: string
  timestamp: number
}

export default function Chat() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map())
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  
  const ws = useWebSocket(projectId)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load initial messages
  useEffect(() => {
    if (projectId) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`http://localhost:8080/api/chat/projects/${projectId}/messages`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          const data = await response.json()
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

  // WebSocket message handler
  useEffect(() => {
    const unsubscribe = ws.onMessage((message: ChatMessage) => {
      setMessages(prev => [...prev, message])
    })
    return unsubscribe
  }, [ws])

  // WebSocket typing indicator
  useEffect(() => {
    const unsubscribe = ws.onTyping((indicator: { userName: string; isTyping: boolean }) => {
      if (indicator.isTyping) {
        setTypingUsers(prev => new Map(prev).set(indicator.userName, {
          name: indicator.userName,
          timestamp: Date.now()
        }))
      } else {
        setTypingUsers(prev => {
          const updated = new Map(prev)
          updated.delete(indicator.userName)
          return updated
        })
      }
    })
    return unsubscribe
  }, [ws])

  // Clean up typing indicator after 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => {
        const updated = new Map(prev)
        const now = Date.now()
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)

    // Send typing indicator
    if (!isTyping && user) {
      ws.sendTypingIndicator(user.name || 'User', true)
      setIsTyping(true)
    }

    // Clear typing after timeout
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !user) return

    ws.sendMessage(
      messageInput,
      user.name || 'User',
      user.avatarUrl
    )

    setMessageInput('')
    setIsTyping(false)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

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

  const typingList = Array.from(typingUsers.values())

  return (
    <div className="space-y-4 h-[calc(100vh-200px)] flex flex-col">
      <div className="text-2xl font-semibold">Team Chat</div>

      {/* Messages Container */}
      <div className="card flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0">
                {message.senderAvatar ? (
                  <img src={message.senderAvatar} alt={message.senderName} className="w-8 h-8 rounded-full" />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{message.senderName}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5 mt-1 text-sm break-words">
                  {message.content}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typingList.length > 0 && (
          <div className="flex gap-3 mt-4">
            <div className="flex-shrink-0">
              <UserCircleIcon className="w-8 h-8 text-slate-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-400">
                {typingList.length === 1 
                  ? `${typingList[0].name} is typing` 
                  : `${typingList.length} people are typing`}
              </div>
              <div className="flex gap-1 mt-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="card p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={messageInput}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="input-primary flex-1"
          />
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            Send
          </button>
        </div>
        {ws.isConnected ? (
          <div className="text-xs text-green-400 mt-2">✓ Connected</div>
        ) : (
          <div className="text-xs text-yellow-400 mt-2">⚠ Connecting...</div>
        )}
      </form>
    </div>
  )
}
