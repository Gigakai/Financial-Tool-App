import { Button, Card, CardBody } from '@nextui-org/react'
import { Target, BarChart3, Activity, AlertTriangle, Bot, Sparkles, ArrowRight } from 'lucide-react'

const ChatWelcome = ({ onQuickAction }) => {
  const capabilities = [
    {
      icon: Target,
      title: 'Simulaciones Inteligentes',
      description: 'Pregúntame "¿Qué pasaría si...?" y evalúo el impacto financiero',
      example: '¿Qué pasaría si contrato 2 desarrolladores?'
    },
    {
      icon: BarChart3,
      title: 'Análisis en Tiempo Real',
      description: 'Consulta ingresos, gastos y métricas al instante',
      example: '¿Cuánto he gastado en marketing este mes?'
    },
    {
      icon: Activity,
      title: 'Diagnóstico Financiero',
      description: 'Reviso tu salud financiera y te doy recomendaciones',
      example: '¿Cómo está mi salud financiera?'
    },
    {
      icon: AlertTriangle,
      title: 'Alertas Proactivas',
      description: 'Te aviso de riesgos antes de que se vuelvan críticos',
      example: '¿Tengo alguna alerta importante?'
    },
  ]

  return (
    <div className="space-y-4 p-2">
      {/* Hero Section */}
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-gradient-to-br from-banorte-red to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Bot size={40} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-banorte-gray mb-2">
          Tu CFO Virtual con IA
        </h2>
        <p className="text-sm text-gray-600 max-w-xs mx-auto">
          Soy tu asistente financiero inteligente. Puedo ayudarte a tomar decisiones informadas sobre tu negocio.
        </p>
      </div>

      {/* Capabilities Cards */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">
          ¿Qué puedo hacer por ti?
        </p>
        {capabilities.map((cap, idx) => {
          const Icon = cap.icon
          return (
            <Card 
              key={idx} 
              isPressable
              onPress={() => onQuickAction(cap.example)}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardBody className="p-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-banorte-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-banorte-red" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-banorte-gray mb-1">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {cap.description}
                    </p>
                    <button 
                      className="text-xs text-banorte-red font-medium hover:underline flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        onQuickAction(cap.example)
                      }}
                    >
                      Pruébalo
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* CTA */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500 mb-3">
          O simplemente pregúntame cualquier cosa sobre tus finanzas
        </p>
        <Button
          color="primary"
          variant="flat"
          fullWidth
          startContent={<Sparkles size={16} />}
          onPress={() => onQuickAction('¿Cómo puedes ayudarme?')}
        >
          Comenzar conversación
        </Button>
      </div>
    </div>
  )
}

export default ChatWelcome
