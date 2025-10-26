import { useState, useEffect } from 'react'
import { Chip } from '@nextui-org/react'
import { Wifi, WifiOff } from 'lucide-react'

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        const response = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000), // 3 second timeout
        })
        setIsConnected(response.ok)
      } catch (error) {
        setIsConnected(false)
      } finally {
        setIsChecking(false)
      }
    }

    // Check immediately
    checkConnection()

    // Check every 10 seconds
    const interval = setInterval(checkConnection, 10000)

    return () => clearInterval(interval)
  }, [])

  if (isChecking) {
    return (
      <Chip
        size="sm"
        variant="flat"
        startContent={<Wifi size={14} className="animate-pulse" />}
        className="text-xs"
      >
        Verificando...
      </Chip>
    )
  }

  return (
    <Chip
      size="sm"
      variant="flat"
      color={isConnected ? 'success' : 'danger'}
      startContent={
        isConnected ? (
          <Wifi size={14} />
        ) : (
          <WifiOff size={14} />
        )
      }
      className="text-xs"
    >
      {isConnected ? 'Conectado' : 'Sin conexión'}
    </Chip>
  )
}

export default ConnectionStatus
