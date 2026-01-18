<<<<<<< HEAD
import { useEffect, useRef, useCallback, useState } from 'react'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

interface WebSocketMessage {
  id?: number
  content: string
  senderName: string
  senderAvatar?: string
  timestamp: number
  type: 'MESSAGE' | 'SYSTEM' | 'NOTIFICATION'
}

interface TypingIndicator {
  userName: string
  isTyping: boolean
}

export const useWebSocket = (projectId: string | null) => {
  const stompClient = useRef<any>(null)
  const messageHandlers = useRef<((msg: WebSocketMessage) => void)[]>([])
  const typingHandlers = useRef<((indicator: TypingIndicator) => void)[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const connect = useCallback(() => {
    if (!projectId || connected.current) return

    try {
      const socket = new SockJS('http://localhost:8080/ws')
      stompClient.current = Stomp.over(socket)

      stompClient.current.connect(
        {},
        () => {
          setIsConnected(true)
          console.log('WebSocket connected')

          // Subscribe to chat messages
          stompClient.current.subscribe(`/topic/chat/${projectId}`, (message: any) => {
            const msg = JSON.parse(message.body)
            messageHandlers.current.forEach(handler => handler(msg))
          })

          // Subscribe to typing indicators
          stompClient.current.subscribe(`/topic/chat/${projectId}/typing`, (message: any) => {
            const typing = JSON.parse(message.body)
            const payload: TypingIndicator = {
              userName: typing.userName,
              isTyping: typing.isTyping ?? typing.typing ?? false
            }
            typingHandlers.current.forEach(handler => handler(payload))
          })
        },
        (error: any) => {
          console.error('WebSocket connection error:', error)
          setIsConnected(false)
        }
      )
    } catch (error) {
      console.error('WebSocket setup error:', error)
    }
  }, [projectId])

  const disconnect = useCallback(() => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.disconnect(() => {
        setIsConnected(false)
        console.log('WebSocket disconnected')
      })
    }
  }, [])

  const sendMessage = useCallback((content: string, senderName: string, senderAvatar?: string) => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.send(
        `/app/chat/${projectId}`,
        {},
        JSON.stringify({
          content,
          senderName,
          senderAvatar
        })
      )
    }
  }, [projectId])

  const sendTypingIndicator = useCallback((userName: string, isTyping: boolean) => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.send(
        `/app/chat/${projectId}/typing`,
        {},
        JSON.stringify({
          userName,
          isTyping,
          typing: isTyping
        })
      )
    }
  }, [projectId])

  const onMessage = useCallback((handler: (msg: WebSocketMessage) => void) => {
    messageHandlers.current.push(handler)
    return () => {
      messageHandlers.current = messageHandlers.current.filter(h => h !== handler)
    }
  }, [])

  const onTyping = useCallback((handler: (indicator: TypingIndicator) => void) => {
    typingHandlers.current.push(handler)
    return () => {
      typingHandlers.current = typingHandlers.current.filter(h => h !== handler)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    sendMessage,
    sendTypingIndicator,
    onMessage,
    onTyping,
    connect,
    disconnect
=======
import { useEffect, useRef, useState } from 'react'

// Lightweight client-side stub to satisfy chat UI without a running backend WebSocket
// Provides event subscription APIs and echoes messages locally.
export function useWebSocket(projectId?: string | null) {
  const messageListeners = useRef<Array<(msg: any) => void>>([])
  const typingListeners = useRef<Array<(data: { userName: string; isTyping: boolean }) => void>>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simulate immediate connection for now
    setIsConnected(true)
    return () => {
      messageListeners.current = []
      typingListeners.current = []
      setIsConnected(false)
    }
  }, [projectId])

  const sendMessage = (content: string, senderName: string, senderAvatar?: string) => {
    const payload = {
      id: Date.now(),
      content,
      senderName,
      senderAvatar,
      timestamp: Date.now(),
      type: 'MESSAGE' as const
    }
    messageListeners.current.forEach(fn => fn(payload))
  }

  const sendTypingIndicator = (userName: string, isTypingFlag: boolean) => {
    typingListeners.current.forEach(fn => fn({ userName, isTyping: isTypingFlag }))
  }

  const onMessage = (handler: (msg: any) => void) => {
    messageListeners.current.push(handler)
    return () => {
      messageListeners.current = messageListeners.current.filter(fn => fn !== handler)
    }
  }

  const onTyping = (handler: (data: { userName: string; isTyping: boolean }) => void) => {
    typingListeners.current.push(handler)
    return () => {
      typingListeners.current = typingListeners.current.filter(fn => fn !== handler)
    }
  }

  return {
    isConnected,
    sendMessage,
    sendTypingIndicator,
    onMessage,
    onTyping
>>>>>>> 187cde22 (Add frontend auth scaffolding and DTOs)
  }
}
