import { createContext, useContext, useState } from 'react'

const ChatContext = createContext()

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext debe usarse dentro de un ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const [chatOpen, setChatOpen] = useState(false)
  const [initialMessage, setInitialMessage] = useState(null)

  const openChatWithMessage = (message) => {
    setInitialMessage(message)
    setChatOpen(true)
  }

  const closeChat = () => {
    setChatOpen(false)
    // Reset initial message after a delay to allow animation
    setTimeout(() => setInitialMessage(null), 300)
  }

  const toggleChat = () => {
    if (chatOpen) {
      closeChat()
    } else {
      setChatOpen(true)
    }
  }

  return (
    <ChatContext.Provider
      value={{
        chatOpen,
        setChatOpen,
        openChatWithMessage,
        closeChat,
        toggleChat,
        initialMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

