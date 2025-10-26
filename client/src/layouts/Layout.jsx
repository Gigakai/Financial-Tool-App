import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import ChatBot from '../components/chat/ChatBot'
import BottomNav from '../components/layout/BottomNav'
import { useChatContext } from '../contexts/ChatContext'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { chatOpen, toggleChat, closeChat } = useChatContext()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header - Now visible on mobile and desktop */}
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onChatClick={toggleChat}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 pt-24 md:pt-4">
          {children}
        </main>

        {/* Bottom Navigation - Mobile only */}
        <BottomNav onChatClick={toggleChat} />
      </div>

      {/* AI Chat Bot - Overlay/Drawer */}
      <ChatBot isOpen={chatOpen} onClose={closeChat} />
    </div>
  )
}

export default Layout
