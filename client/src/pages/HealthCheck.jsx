import { useState } from 'react'
import { Card, CardBody, CardHeader, Progress, Chip, Divider, Button, Accordion, AccordionItem } from '@nextui-org/react'
import { Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, DollarSign, Calendar, Target, Zap, Shield, ArrowRight } from 'lucide-react'

const HealthCheck = () => {
  const [healthScore] = useState(72)

  // Datos de salud financiera
  const metrics = {
    runway: { value: 14, max: 24, status: 'warning', label: 'Margen de Supervivencia (meses)' },
    cashFlow: { value: 85, max: 100, status: 'good', label: 'Flujo de Caja' },
    profitMargin: { value: 32, max: 100, status: 'good', label: 'Margen de Ganancia' },
    debtRatio: { value: 28, max: 100, status: 'excellent', label: 'Ratio de Deuda' },
    burnRate: { value: 45, max: 100, status: 'warning', label: 'Tasa de Consumo' },
    liquidityRatio: { value: 78, max: 100, status: 'good', label: 'Ratio de Liquidez' }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'success'
      case 'good': return 'primary'
      case 'warning': return 'warning'
      case 'danger': return 'danger'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle2 size={20} className="text-positive" />
      case 'warning':
        return <AlertTriangle size={20} className="text-warning" />
      case 'danger':
        return <AlertTriangle size={20} className="text-alert" />
      default:
        return <Activity size={20} className="text-gray-400" />
    }
  }

  const recommendations = [
    {
      title: 'Optimizar Flujo de Caja',
      description: 'Considera renegociar términos de pago con proveedores para mejorar tu liquidez.',
      priority: 'high',
      impact: '+15% liquidez',
      icon: DollarSign
    },
    {
      title: 'Reducir Gastos Operativos',
      description: 'Identifica gastos no esenciales que puedan ser recortados o pospuestos.',
      priority: 'medium',
      impact: '+3 meses runway',
      icon: Target
    },
    {
      title: 'Diversificar Fuentes de Ingreso',
      description: 'Explora nuevos productos o servicios para estabilizar tus ingresos.',
      priority: 'medium',
      impact: '+20% estabilidad',
      icon: TrendingUp
    }
  ]

  const alerts = [
    { type: 'warning', message: 'Tu runway está por debajo del promedio recomendado (18 meses)', time: 'Hace 2 horas' },
    { type: 'info', message: 'Flujo de caja positivo por 3 meses consecutivos', time: 'Hace 1 día' },
    { type: 'success', message: 'Ratio de deuda mejoró un 5% este mes', time: 'Hace 3 días' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-banorte-gray">Diagnóstico Financiero</h1>
        <p className="text-gray-500 mt-2">Análisis completo de tu salud financiera</p>
      </div>

      {/* Score Principal */}
      <Card className="border border-gray-200 bg-gradient-to-br from-banorte-red via-red-600 to-red-700">
        <CardBody className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Activity size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Puntuación de Salud</p>
                  <p className="text-white text-4xl font-bold">{healthScore}/100</p>
                </div>
              </div>
              <p className="text-white/90 text-sm mb-4">
                Tu empresa está en buen estado financiero. Hay áreas de mejora identificadas.
              </p>
              <Chip
                color="success"
                variant="flat"
                className="bg-white/20 text-white"
                startContent={<CheckCircle2 size={16} />}
              >
                Estado: Saludable
              </Chip>
            </div>
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="white"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${(healthScore / 100) * 502.4} 502.4`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold text-white">{healthScore}</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(healthData).map(([key, data]) => (
          <Card key={key} className="border border-gray-200">
            <CardBody className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">{data.label}</p>
                  <p className="text-2xl font-bold text-banorte-gray mt-1">
                    {key === 'runway' ? `${data.value} meses` : `${data.value}%`}
                  </p>
                </div>
                {getStatusIcon(data.status)}
              </div>
              <Progress
                value={(data.value / data.max) * 100}
                color={getStatusColor(data.status)}
                className="mb-2"
              />
              <div className="flex items-center justify-between">
                <Chip size="sm" color={getStatusColor(data.status)} variant="flat">
                  {data.status === 'excellent' && 'Excelente'}
                  {data.status === 'good' && 'Bueno'}
                  {data.status === 'warning' && 'Atención'}
                  {data.status === 'danger' && 'Crítico'}
                </Chip>
                <span className="text-xs text-gray-400">
                  {key === 'runway' ? `de ${data.max}` : `${data.max}%`}
                </span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Recomendaciones */}
      <Card className="border border-gray-200">
        <CardHeader className="flex gap-3 bg-gray-50 border-b">
          <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
            <Zap size={20} className="text-warning" />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-bold text-banorte-gray">Recomendaciones Personalizadas</p>
            <p className="text-sm text-gray-500">Acciones sugeridas para mejorar tu salud financiera</p>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon
              return (
                <Card key={index} className="border border-gray-200 hover:border-banorte-red transition-colors">
                  <CardBody className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        rec.priority === 'high' ? 'bg-alert/10' : 'bg-warning/10'
                      }`}>
                        <Icon size={24} className={rec.priority === 'high' ? 'text-alert' : 'text-warning'} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-banorte-gray">{rec.title}</h3>
                          <Chip size="sm" color={rec.priority === 'high' ? 'danger' : 'warning'} variant="flat">
                            {rec.priority === 'high' ? 'Alta' : 'Media'} prioridad
                          </Chip>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                        <div className="flex items-center justify-between">
                          <Chip size="sm" variant="flat" color="success" startContent={<TrendingUp size={14} />}>
                            Impacto: {rec.impact}
                          </Chip>
                          <Button size="sm" variant="light" color="primary" endContent={<ArrowRight size={16} />}>
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        </CardBody>
      </Card>

      {/* Alertas y Detalles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas Recientes */}
        <Card className="border border-gray-200">
          <CardHeader className="flex gap-3 bg-gray-50 border-b">
            <div className="w-10 h-10 bg-alert/10 rounded-full flex items-center justify-center">
              <AlertTriangle size={20} className="text-alert" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-bold text-banorte-gray">Alertas Recientes</p>
              <p className="text-sm text-gray-500">Notificaciones importantes</p>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    alert.type === 'warning' ? 'bg-warning' :
                    alert.type === 'success' ? 'bg-positive' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-banorte-gray">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Calendar size={12} />
                      {alert.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Análisis Detallado */}
        <Card className="border border-gray-200">
          <CardHeader className="flex gap-3 bg-gray-50 border-b">
            <div className="w-10 h-10 bg-positive/10 rounded-full flex items-center justify-center">
              <Shield size={20} className="text-positive" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-bold text-banorte-gray">Análisis Detallado</p>
              <p className="text-sm text-gray-500">Información adicional</p>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Accordion>
              <AccordionItem
                key="1"
                aria-label="Fortalezas"
                title="Fortalezas Financieras"
                startContent={<CheckCircle2 size={20} className="text-positive" />}
              >
                <div className="pb-4 text-sm text-gray-600 space-y-2">
                  <p>• Flujo de caja positivo consistente</p>
                  <p>• Bajo ratio de deuda (28%)</p>
                  <p>• Margen de ganancia saludable (32%)</p>
                  <p>• Buena liquidez para operaciones</p>
                </div>
              </AccordionItem>
              <AccordionItem
                key="2"
                aria-label="Áreas de mejora"
                title="Áreas de Mejora"
                startContent={<TrendingUp size={20} className="text-warning" />}
              >
                <div className="pb-4 text-sm text-gray-600 space-y-2">
                  <p>• Runway por debajo del objetivo (14 vs 18 meses)</p>
                  <p>• Tasa de consumo elevada (45%)</p>
                  <p>• Concentración de ingresos en pocos clientes</p>
                  <p>• Reservas de emergencia insuficientes</p>
                </div>
              </AccordionItem>
              <AccordionItem
                key="3"
                aria-label="Riesgos"
                title="Riesgos Identificados"
                startContent={<AlertTriangle size={20} className="text-alert" />}
              >
                <div className="pb-4 text-sm text-gray-600 space-y-2">
                  <p>• Dependencia de financiamiento externo</p>
                  <p>• Vulnerabilidad a cambios de mercado</p>
                  <p>• Falta de diversificación de productos</p>
                  <p>• Escasa planificación de contingencia</p>
                </div>
              </AccordionItem>
            </Accordion>
          </CardBody>
        </Card>
      </div>

      {/* CTA */}
      <Card className="border-2 border-banorte-red bg-gradient-to-r from-red-50 to-orange-50">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-banorte-red/10 rounded-full flex items-center justify-center">
                <Target size={32} className="text-banorte-red" />
              </div>
              <div>
                <p className="font-bold text-lg text-banorte-gray">¿Necesitas ayuda?</p>
                <p className="text-sm text-gray-600">Habla con nuestro asistente IA para recibir consejos personalizados</p>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-banorte-red text-white"
              endContent={<ArrowRight size={20} />}
            >
              Consultar IA
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default HealthCheck
