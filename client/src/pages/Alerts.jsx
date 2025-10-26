import { useState } from 'react'
import { Card, CardBody, CardHeader, Badge, Button, Chip, Tabs, Tab, Divider, Avatar } from '@nextui-org/react'
import { AlertTriangle, CheckCircle2, Info, TrendingDown, TrendingUp, Clock, DollarSign, Target, Bell, BellOff, Archive, Trash2, Filter, Calendar } from 'lucide-react'

const Alerts = () => {
  const [filter, setFilter] = useState('all')
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'critical',
      title: 'Runway crítico: 8 meses restantes',
      description: 'Tu empresa tiene solo 8 meses de operación con el capital actual. Se recomienda reducir gastos o buscar financiamiento.',
      timestamp: '2024-10-26T10:30:00',
      read: false,
      category: 'runway',
      icon: AlertTriangle,
      action: 'Ver análisis detallado'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Gasto inusual detectado',
      description: 'Se registró un gasto de $45,000 en "Servicios Externos", 250% por encima del promedio mensual.',
      timestamp: '2024-10-26T09:15:00',
      read: false,
      category: 'expenses',
      icon: TrendingDown,
      action: 'Revisar transacción'
    },
    {
      id: 3,
      type: 'success',
      title: 'Meta de ingresos alcanzada',
      description: 'Felicidades, has superado tu meta mensual de ingresos en un 15%.',
      timestamp: '2024-10-25T18:45:00',
      read: true,
      category: 'revenue',
      icon: TrendingUp,
      action: 'Ver detalles'
    },
    {
      id: 4,
      type: 'info',
      title: 'Próximo pago de nómina',
      description: 'Recordatorio: El pago de nómina de $85,000 está programado para el 30 de octubre.',
      timestamp: '2024-10-25T14:00:00',
      read: true,
      category: 'payments',
      icon: Calendar,
      action: 'Confirmar pago'
    },
    {
      id: 5,
      type: 'warning',
      title: 'Flujo de caja bajo',
      description: 'Tu balance disponible es de $32,000, por debajo del mínimo recomendado de $50,000.',
      timestamp: '2024-10-24T11:20:00',
      read: false,
      category: 'cashflow',
      icon: DollarSign,
      action: 'Ver recomendaciones'
    },
    {
      id: 6,
      type: 'critical',
      title: 'Factura vencida',
      description: 'La factura #F-2024-0234 de $12,500 está vencida hace 15 días. Cliente: Tech Solutions SA.',
      timestamp: '2024-10-24T08:30:00',
      read: false,
      category: 'invoices',
      icon: Clock,
      action: 'Gestionar cobro'
    },
    {
      id: 7,
      type: 'info',
      title: 'Nuevo cliente registrado',
      description: 'Se ha agregado un nuevo cliente a tu cartera: Innovation Corp. Ingresos estimados: $25,000/mes.',
      timestamp: '2024-10-23T16:00:00',
      read: true,
      category: 'clients',
      icon: Target,
      action: 'Ver perfil'
    },
    {
      id: 8,
      type: 'success',
      title: 'Reducción de gastos exitosa',
      description: 'Has reducido los gastos operativos en un 12% comparado con el mes anterior.',
      timestamp: '2024-10-23T10:00:00',
      read: true,
      category: 'expenses',
      icon: CheckCircle2,
      action: 'Ver informe'
    }
  ])

  const getAlertStyle = (type) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-alert',
          iconBg: 'bg-alert/10',
          iconColor: 'text-alert',
          chipColor: 'danger'
        }
      case 'warning':
        return {
          bg: 'bg-orange-50',
          border: 'border-warning',
          iconBg: 'bg-warning/10',
          iconColor: 'text-warning',
          chipColor: 'warning'
        }
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-positive',
          iconBg: 'bg-positive/10',
          iconColor: 'text-positive',
          chipColor: 'success'
        }
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          iconBg: 'bg-blue-500/10',
          iconColor: 'text-blue-500',
          chipColor: 'primary'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-500',
          chipColor: 'default'
        }
    }
  }

  const getCategoryLabel = (category) => {
    const labels = {
      runway: 'Runway',
      expenses: 'Gastos',
      revenue: 'Ingresos',
      payments: 'Pagos',
      cashflow: 'Flujo de Caja',
      invoices: 'Facturas',
      clients: 'Clientes'
    }
    return labels[category] || category
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Hace unos minutos'
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    const diffInDays = Math.floor(diffInHours / 24)
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
  }

  const markAsRead = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ))
  }

  const deleteAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    if (filter === 'unread') return !alert.read
    return alert.type === filter
  })

  const stats = {
    total: alerts.length,
    unread: alerts.filter(a => !a.read).length,
    critical: alerts.filter(a => a.type === 'critical').length,
    warning: alerts.filter(a => a.type === 'warning').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-banorte-gray">Centro de Alertas</h1>
          <p className="text-gray-500 mt-2">Notificaciones y alertas financieras importantes</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="bordered"
            startContent={<Archive size={18} />}
            size="sm"
          >
            Archivar leídas
          </Button>
          <Button
            variant="bordered"
            startContent={<BellOff size={18} />}
            size="sm"
          >
            Silenciar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardBody className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bell size={20} className="text-banorte-gray" />
              <p className="text-2xl font-bold text-banorte-gray">{stats.total}</p>
            </div>
            <p className="text-sm text-gray-500">Total</p>
          </CardBody>
        </Card>
        <Card className="border border-blue-200 bg-blue-50">
          <CardBody className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge content={stats.unread} color="primary" size="sm">
                <Bell size={20} className="text-blue-600" />
              </Badge>
              <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
            </div>
            <p className="text-sm text-blue-700">No leídas</p>
          </CardBody>
        </Card>
        <Card className="border border-red-200 bg-red-50">
          <CardBody className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle size={20} className="text-alert" />
              <p className="text-2xl font-bold text-alert">{stats.critical}</p>
            </div>
            <p className="text-sm text-alert">Críticas</p>
          </CardBody>
        </Card>
        <Card className="border border-orange-200 bg-orange-50">
          <CardBody className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Info size={20} className="text-warning" />
              <p className="text-2xl font-bold text-warning">{stats.warning}</p>
            </div>
            <p className="text-sm text-warning">Advertencias</p>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200">
        <CardBody className="p-4">
          <Tabs
            selectedKey={filter}
            onSelectionChange={setFilter}
            color="primary"
            variant="underlined"
            classNames={{
              tabList: "gap-6",
              cursor: "bg-banorte-red",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-banorte-red"
            }}
          >
            <Tab
              key="all"
              title={
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  <span>Todas</span>
                  <Chip size="sm" variant="flat">{alerts.length}</Chip>
                </div>
              }
            />
            <Tab
              key="unread"
              title={
                <div className="flex items-center gap-2">
                  <Bell size={16} />
                  <span>No leídas</span>
                  {stats.unread > 0 && (
                    <Chip size="sm" color="primary" variant="flat">{stats.unread}</Chip>
                  )}
                </div>
              }
            />
            <Tab
              key="critical"
              title={
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span>Críticas</span>
                  {stats.critical > 0 && (
                    <Chip size="sm" color="danger" variant="flat">{stats.critical}</Chip>
                  )}
                </div>
              }
            />
            <Tab
              key="warning"
              title={
                <div className="flex items-center gap-2">
                  <Info size={16} />
                  <span>Advertencias</span>
                </div>
              }
            />
            <Tab
              key="success"
              title={
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Logros</span>
                </div>
              }
            />
          </Tabs>
        </CardBody>
      </Card>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card className="border border-gray-200">
            <CardBody className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bell size={40} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-600">No hay alertas</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {filter === 'unread' 
                      ? 'Todas tus alertas han sido leídas' 
                      : 'No tienes alertas en esta categoría'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const style = getAlertStyle(alert.type)
            const Icon = alert.icon
            
            return (
              <Card
                key={alert.id}
                className={`border-2 ${style.border} ${!alert.read ? style.bg : 'bg-white'} transition-all hover:shadow-md`}
              >
                <CardBody className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 ${style.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon size={24} className={style.iconColor} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-bold text-banorte-gray ${!alert.read ? 'text-base' : 'text-sm'}`}>
                              {alert.title}
                            </h3>
                            {!alert.read && (
                              <div className="w-2 h-2 bg-banorte-red rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {alert.description}
                          </p>
                        </div>
                        <Chip
                          size="sm"
                          color={style.chipColor}
                          variant="flat"
                        >
                          {getCategoryLabel(alert.category)}
                        </Chip>
                      </div>

                      <Divider className="my-3" />

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock size={14} />
                          <span>{getTimeAgo(alert.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            className="bg-banorte-red/10 text-banorte-red"
                          >
                            {alert.action}
                          </Button>
                          {!alert.read && (
                            <Button
                              size="sm"
                              variant="light"
                              isIconOnly
                              onPress={() => markAsRead(alert.id)}
                            >
                              <CheckCircle2 size={18} className="text-gray-400" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={() => deleteAlert(alert.id)}
                          >
                            <Trash2 size={18} className="text-gray-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })
        )}
      </div>

      {/* Empty state or load more */}
      {filteredAlerts.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button variant="bordered" className="border-banorte-red text-banorte-red">
            Cargar más alertas
          </Button>
        </div>
      )}
    </div>
  )
}

export default Alerts
