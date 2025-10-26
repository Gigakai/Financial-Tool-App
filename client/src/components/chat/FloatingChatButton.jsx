import { Button } from '@nextui-org/react'
import { Bot, Sparkles } from 'lucide-react'

const FloatingChatButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 
                 w-16 h-16 bg-gradient-to-br from-banorte-red to-red-700 
                 rounded-full shadow-2xl flex items-center justify-center
                 animate-pulse-soft hover:scale-110 transition-transform
                 md:hidden"
    >
      <Bot size={32} className="text-white" strokeWidth={2} />
      
      {/* Ping animation */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-banorte-red opacity-75 animate-ping" />
      
      {/* Badge */}
      <div className="absolute -top-1 -right-1 w-6 h-6 bg-positive text-white text-xs font-bold rounded-full flex items-center justify-center">
        <Sparkles size={12} />
      </div>
    </button>
  )
}

export default FloatingChatButton
