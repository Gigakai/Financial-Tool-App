import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import ChatBot from '../components/chat/ChatBot'
import BottomNav from '../components/layout/BottomNav'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true) // Desktop: open by default
  const [chatOpen, setChatOpen] = useState(false)

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
          onChatClick={() => setChatOpen(!chatOpen)}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 pt-24 md:pt-4">
          {children}
        </main>

        {/* Bottom Navigation - Mobile only */}
        <BottomNav onChatClick={() => setChatOpen(!chatOpen)} />
      </div>

      {/* AI Chat Bot - Overlay/Drawer */}
      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}

export default Layout
