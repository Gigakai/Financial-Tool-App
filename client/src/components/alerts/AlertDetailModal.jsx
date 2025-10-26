import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Divider, Chip } from '@nextui-org/react'
import { AlertTriangle, Info, CheckCircle2, Lightbulb, TrendingDown, TrendingUp } from 'lucide-react'

const AlertDetailModal = ({ isOpen, onClose, alert }) => {
  if (!alert) return null

  const getAlertStyle = (type) => {
    switch (type) {
      case 'critical':
        return {
          color: 'text-alert',
          bg: 'bg-alert/10',
          icon: AlertTriangle
        }
      case 'warning':
        return {
          color: 'text-warning',
          bg: 'bg-warning/10',
          icon: Info
        }
      case 'success':
        return {
          color: 'text-positive',
          bg: 'bg-positive/10',
          icon: CheckCircle2
        }
      default:
        return {
          color: 'text-blue-500',
          bg: 'bg-blue-500/10',
          icon: Info
        }
    }
  }

  const style = getAlertStyle(alert.type)
  const Icon = style.icon

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${style.bg} rounded-full flex items-center justify-center`}>
              <Icon size={24} className={style.color} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-banorte-gray">{alert.title}</h3>
              <Chip size="sm" color={alert.type === 'critical' ? 'danger' : 'warning'} variant="flat">
                {alert.category}
              </Chip>
            </div>
          </div>
        </ModalHeader>
        
        <Divider />
        
        <ModalBody className="py-6">
          {/* Descripción principal */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-banorte-gray mb-2">📋 Descripción</h4>
              <p className="text-gray-600 leading-relaxed">{alert.description}</p>
            </div>

            {/* Recomendación */}
            {alert.recommendation && (
              <>
                <Divider />
                <div className={`p-4 rounded-lg ${style.bg}`}>
                  <div className="flex items-start gap-3">
                    <Lightbulb size={20} className={style.color} />
                    <div>
                      <h4 className={`font-semibold ${style.color} mb-2`}>💡 Recomendación</h4>
                      <p className="text-gray-700 leading-relaxed">{alert.recommendation}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Metadata adicional */}
            {alert.metadata && Object.keys(alert.metadata).length > 0 && (
              <>
                <Divider />
                <div>
                  <h4 className="font-semibold text-banorte-gray mb-3">📊 Datos adicionales</h4>
                  <div className="space-y-2">
                    {/* Cashflow details */}
                    {alert.metadata.currentCash !== undefined && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Efectivo actual:</span>
                        <span className="font-semibold text-banorte-gray">
                          ${alert.metadata.currentCash.toLocaleString('es-MX')}
                        </span>
                      </div>
                    )}
                    {alert.metadata.dailyBurn !== undefined && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Gasto diario promedio:</span>
                        <span className="font-semibold text-alert">
                          ${alert.metadata.dailyBurn.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {alert.metadata.daysUntilZero !== undefined && (
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-gray-600">Días hasta saldo cero:</span>
                        <span className="font-bold text-alert text-lg">
                          {alert.metadata.daysUntilZero} días
                        </span>
                      </div>
                    )}

                    {/* Historical comparison */}
                    {alert.metadata.historicalAverage !== undefined && (
                      <>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Promedio histórico:</span>
                          <span className="font-semibold text-gray-700">
                            ${alert.metadata.historicalAverage.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Monto actual:</span>
                          <span className="font-semibold text-warning">
                            ${alert.metadata.currentAmount?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Increase percentage */}
                    {alert.metadata.increasePercent !== undefined && (
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-gray-600">Incremento:</span>
                        <div className="flex items-center gap-2">
                          <TrendingUp size={18} className="text-warning" />
                          <span className="font-bold text-warning">
                            +{alert.metadata.increasePercent}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Trend data */}
                    {alert.metadata.month1 !== undefined && (
                      <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <p className="text-sm font-semibold text-gray-600 mb-2">Evolución (últimos 3 meses):</p>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hace 3 meses:</span>
                          <span className="font-semibold">${alert.metadata.month3?.toFixed(2) || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hace 2 meses:</span>
                          <span className="font-semibold">${alert.metadata.month2?.toFixed(2) || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mes actual:</span>
                          <span className="font-semibold">${alert.metadata.month1?.toFixed(2) || '0'}</span>
                        </div>
                        {alert.metadata.declinePercent && (
                          <div className="flex items-center justify-center gap-2 mt-2 p-2 bg-red-50 rounded">
                            <TrendingDown size={16} className="text-alert" />
                            <span className="text-sm font-bold text-alert">
                              Caída del {alert.metadata.declinePercent}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Timestamp */}
            <Divider />
            <div className="text-sm text-gray-400">
              Detectado: {new Date(alert.timestamp).toLocaleString('es-MX', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </ModalBody>
        
        <Divider />
        
        <ModalFooter>
          <Button 
            color="default" 
            variant="light" 
            onPress={onClose}
          >
            Cerrar
          </Button>
          <Button 
            color="primary" 
            className="bg-banorte-red"
            onPress={() => {
              // TODO: Implementar acción específica por tipo de alerta
              alert('Funcionalidad próximamente')
            }}
          >
            {alert.action || 'Tomar acción'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AlertDetailModal
