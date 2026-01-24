import { useEffect, useRef, useCallback } from 'react'
import SockJS from 'sockjs-client' // SockJS provides fallback options for WebSocket connections
import Stomp from 'stompjs' // STOMP protocol for structured messaging over WebSocket

// Define the shape of a chat message
interface WebSocketMessage {
  id?: number
  content: string
  senderName: string
  senderAvatar?: string
  timestamp: number
  type: 'MESSAGE' | 'SYSTEM' | 'NOTIFICATION' // Different message types
}

// Define the shape of typing indicator
interface TypingIndicator {
  userName: string
  isTyping: boolean
}

/**
 * Custom React Hook: useWebSocket
 * Handles connecting to WebSocket, sending messages, receiving messages,
 * and handling typing indicators for a project-based chat.
 */
export const useWebSocket = (projectId: string | null) => {
  const stompClient = useRef<any>(null) // Reference to the STOMP WebSocket client
  const messageHandlers = useRef<((msg: WebSocketMessage) => void)[]>([]) // Registered callbacks for messages
  const typingHandlers = useRef<((indicator: TypingIndicator) => void)[]>([]) // Registered callbacks for typing
  const connected = useRef(false) // Track connection state

  /**
   * Connect to WebSocket server
   * 1️⃣ Creates SockJS connection
   * 2️⃣ Wraps with STOMP client
   * 3️⃣ Subscribes to project chat messages and typing events
   */
  const connect = useCallback(() => {
    if (!projectId || connected.current) return // Avoid reconnecting

    try {
      const socket = new SockJS('http://localhost:8080/ws') // Backend WebSocket endpoint
      stompClient.current = Stomp.over(socket) // Wrap SockJS with STOMP

      stompClient.current.connect(
        {}, // Optional headers
        () => { // On successful connection
          connected.current = true
          console.log('WebSocket connected')

          // Subscribe to chat messages for the project
          stompClient.current.subscribe(`/topic/chat/${projectId}`, (message: any) => {
            const msg = JSON.parse(message.body) // Convert JSON string to object
            messageHandlers.current.forEach(handler => handler(msg)) // Call all registered message callbacks
          })

          // Subscribe to typing indicators for the project
          stompClient.current.subscribe(`/topic/chat/${projectId}/typing`, (message: any) => {
            const typing = JSON.parse(message.body)
            typingHandlers.current.forEach(handler => handler(typing)) // Call all registered typing callbacks
          })
        },
        (error: any) => { // On connection error
          console.error('WebSocket connection error:', error)
          connected.current = false
        }
      )
    } catch (error) {
      console.error('WebSocket setup error:', error)
    }
  }, [projectId])

  /**
   * Disconnect WebSocket when component unmounts or project changes
   */
  const disconnect = useCallback(() => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.disconnect(() => {
        connected.current = false
        console.log('WebSocket disconnected')
      })
    }
  }, [])

  /**
   * Send chat message
   * Frontend → WebSocket → Backend (ChatWebSocket.java) → DB → Broadcast
   */
  const sendMessage = useCallback((content: string, senderName: string, senderAvatar?: string) => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.send(
        `/app/chat/${projectId}`, // Backend mapping in ChatWebSocket
        {},
        JSON.stringify({
          content,
          senderName,
          senderAvatar
        })
      )
    }
  }, [projectId])

  /**
   * Send typing indicator
   * Frontend → WebSocket → Backend → Broadcast → Other clients show typing status
   */
  const sendTypingIndicator = useCallback((userName: string, isTyping: boolean) => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.send(
        `/app/chat/${projectId}/typing`, // Backend mapping
        {},
        JSON.stringify({
          userName,
          typing: isTyping
        })
      )
    }
  }, [projectId])

  /**
   * Register callback for incoming messages
   * Example usage: onMessage(msg => addToChat(msg))
   */
  const onMessage = useCallback((handler: (msg: WebSocketMessage) => void) => {
    messageHandlers.current.push(handler)
    return () => {
      // Remove handler on cleanup
      messageHandlers.current = messageHandlers.current.filter(h => h !== handler)
    }
  }, [])

  /**
   * Register callback for typing indicator events
   */
  const onTyping = useCallback((handler: (indicator: TypingIndicator) => void) => {
    typingHandlers.current.push(handler)
    return () => {
      typingHandlers.current = typingHandlers.current.filter(h => h !== handler)
    }
  }, [])

  /**
   * Connect on mount and disconnect on unmount
   */
  useEffect(() => {
    connect() // Establish connection when projectId is set
    return () => {
      disconnect() // Clean up when component unmounts
    }
  }, [connect, disconnect])

  // Return WebSocket API for frontend components
  return {
    isConnected: connected.current, // True if connected
    sendMessage, // Send chat message
    sendTypingIndicator, // Send typing status
    onMessage, // Subscribe to incoming messages
    onTyping, // Subscribe to typing events
    connect, // Manual connect
    disconnect // Manual disconnect
  }
}
