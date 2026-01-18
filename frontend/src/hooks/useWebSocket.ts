import { useEffect, useRef, useCallback } from 'react'
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
  const connected = useRef(false)

  const connect = useCallback(() => {
    if (!projectId || connected.current) return

    try {
      const socket = new SockJS('http://localhost:8080/ws')
      stompClient.current = Stomp.over(socket)

      stompClient.current.connect(
        {},
        () => {
          connected.current = true
          console.log('WebSocket connected')

          // Subscribe to chat messages
          stompClient.current.subscribe(`/topic/chat/${projectId}`, (message: any) => {
            const msg = JSON.parse(message.body)
            messageHandlers.current.forEach(handler => handler(msg))
          })

          // Subscribe to typing indicators
          stompClient.current.subscribe(`/topic/chat/${projectId}/typing`, (message: any) => {
            const typing = JSON.parse(message.body)
            typingHandlers.current.forEach(handler => handler(typing))
          })
        },
        (error: any) => {
          console.error('WebSocket connection error:', error)
          connected.current = false
        }
      )
    } catch (error) {
      console.error('WebSocket setup error:', error)
    }
  }, [projectId])

  const disconnect = useCallback(() => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.disconnect(() => {
        connected.current = false
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
    isConnected: connected.current,
    sendMessage,
    sendTypingIndicator,
    onMessage,
    onTyping,
    connect,
    disconnect
  }
}
