import { useState, useRef, useEffect } from 'react'
import { Button, Input, Card, CardBody, Chip, Avatar } from '@nextui-org/react'
import { X, Send, Bot as BotIcon, Target, BarChart3, Activity, AlertTriangle } from 'lucide-react'
import ChatWelcome from './ChatWelcome'
import api from '../../services/api'
import { useChatContext } from '../../contexts/ChatContext'

// Helper para obtener las etiquetas de las herramientas
const getToolLabel = (toolName) => {
  const toolLabels = {
    simulateFinancialScenario: '🎯 Simulador',
    getFinancialSummary: '📊 Resumen',
    getFinancialHealthCheck: '💚 Health Check',
    checkForFinancialAlerts: '⚠️ Alertas',
    getProfitabilityAnalysis: '💰 Rentabilidad',
    fallback: '💬 Conversación',
  }
  return toolLabels[toolName] || '🤖 IA'
}

const ChatBot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const { initialMessage } = useChatContext()
  const hasProcessedInitialMessage = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickActions = [
    { icon: Target, label: 'Simular escenario', action: '¿Qué pasaría si contrato un nuevo desarrollador?' },
    { icon: BarChart3, label: 'Ver resumen', action: 'Muéstrame el resumen financiero del mes' },
    { icon: Activity, label: 'Health Check', action: '¿Cómo está mi salud financiera?' },
    { icon: AlertTriangle, label: 'Alertas', action: '¿Tengo alguna alerta importante?' },
  ]

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return

    // Hide welcome screen
    if (showWelcome) setShowWelcome(false)

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)
    setError(null)

    try {
      // Llamar al API del CFO Virtual
      const response = await api.askCFO(text.trim())
      
      // Extraer la respuesta del LLM
      const botText = response.response || 'Lo siento, no pude procesar tu solicitud.'
      const toolUsed = response.toolUsed || 'unknown'
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: botText,
        timestamp: new Date(),
        toolUsed,
        data: response.data, // Datos adicionales del MCP si se necesitan
      }
      
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      setIsTyping(false)
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: '⚠️ Disculpa, tuve un problema al conectar con el servidor. Por favor, asegúrate de que el servidor esté corriendo e intenta de nuevo.',
        timestamp: new Date(),
        isError: true,
      }
      
      setMessages((prev) => [...prev, errorMessage])
      setError('Error de conexión con el servidor')
    }
  }

  const handleQuickAction = (action) => {
    handleSend(action)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Process initial message when chat opens with one
  useEffect(() => {
    if (isOpen && initialMessage && !hasProcessedInitialMessage.current) {
      hasProcessedInitialMessage.current = true
      // Send the initial message automatically
      handleSend(initialMessage)
    } else if (!isOpen) {
      // Reset the flag when chat closes
      hasProcessedInitialMessage.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialMessage])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Chat Container */}
      <div
        className={`
          fixed z-50 bg-white shadow-2xl
          md:right-6 md:bottom-6 md:w-96 md:h-[600px] md:rounded-2xl
          inset-0 md:inset-auto
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="gradient-banorte text-white p-4 flex items-center justify-between md:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <BotIcon size={24} className="text-banorte-red" />
            </div>
            <div>
              <h3 className="font-bold text-lg">CFO Virtual IA</h3>
              <div className="flex items-center gap-1 text-xs opacity-90">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                En línea
              </div>
            </div>
          </div>
          <Button
            isIconOnly
            variant="light"
            onPress={onClose}
            className="text-white"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {/* Welcome Screen */}
          {showWelcome && messages.length === 0 && (
            <ChatWelcome onQuickAction={handleSend} />
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {message.type === 'bot' && (
                <div className="w-8 h-8 bg-gradient-to-br from-banorte-red to-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <BotIcon size={18} className="text-white" />
                </div>
              )}
              <div className="flex flex-col gap-1 max-w-[75%]">
                <div
                  className={`
                    px-4 py-3 rounded-2xl
                    ${message.type === 'user'
                      ? 'bg-banorte-red text-white rounded-br-sm'
                      : message.isError 
                        ? 'bg-red-50 text-red-800 shadow-sm rounded-bl-sm border border-red-200'
                        : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                    }
                  `}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <span className={`text-xs mt-1 block ${message.type === 'user' ? 'text-red-100' : message.isError ? 'text-red-400' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {/* Tool badge para mensajes del bot */}
                {message.type === 'bot' && message.toolUsed && !message.isError && (
                  <div className="flex items-center gap-1 px-2">
                    <Chip
                      size="sm"
                      variant="flat"
                      color="primary"
                      className="text-xs h-5"
                    >
                      {getToolLabel(message.toolUsed)}
                    </Chip>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-banorte-red to-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                <BotIcon size={18} className="text-white" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions - Only show if not in welcome and few messages */}
        {!showWelcome && messages.length > 0 && messages.length <= 2 && (
          <div className="p-4 bg-white border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Acciones rápidas:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, idx) => {
                const Icon = action.icon
                return (
                  <Button
                    key={idx}
                    size="sm"
                    variant="flat"
                    className="justify-start h-auto py-2"
                    onPress={() => handleQuickAction(action.action)}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} />
                      <span className="text-xs">{action.label}</span>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 md:rounded-b-2xl">
          <div className="flex gap-2">
            <Input
              placeholder="Escribe tu pregunta..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              classNames={{
                input: 'text-sm',
                inputWrapper: 'bg-gray-100 border-none',
              }}
            />
            <Button
              isIconOnly
              color="primary"
              onPress={() => handleSend()}
              isDisabled={!inputValue.trim()}
              className="gradient-banorte"
            >
              <Send size={18} />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Potenciado por IA avanzada para análisis financiero
          </p>
        </div>
      </div>
    </>
  )
}

export default ChatBot
