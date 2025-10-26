import { Avatar } from '@nextui-org/react'
import { Bot } from 'lucide-react'

const ChatMessage = ({ message, type }) => {
  const isUser = type === 'user'

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-banorte-red to-red-700 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot size={18} className="text-white" />
        </div>
      )}
      <div
        className={`
          max-w-[75%] px-4 py-3 rounded-2xl
          ${isUser
            ? 'bg-banorte-red text-white rounded-br-sm'
            : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
          }
        `}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        <span className={`text-xs mt-1 block ${isUser ? 'text-red-100' : 'text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

export default ChatMessage
