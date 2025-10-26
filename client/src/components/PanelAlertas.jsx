import { useState } from 'react'

// eslint-disable-next-line no-unused-vars
function PanelAlertas({ empresa }) {
  // Alertas de ejemplo (en producción vendrían del servidor)
  const [alertas] = useState([
    {
      id: 1,
      tipo: 'BUDGET_EXCEEDED',
      severidad: 'Alto',
      categoria: 'marketing',
      mensaje: '¡Alerta! Se ha superado el presupuesto de Marketing. Gasto actual: $28,500 de un presupuesto de $30,000 (95%).',
      fecha: '2025-10-25',
      leida: false,
      emoji: '⚠️'
    },
    {
      id: 2,
      tipo: 'PACING_WARNING',
      severidad: 'Medio',
      categoria: 'personal',
      mensaje: 'Atención: El ritmo de gasto en Personal es muy alto. Ya se ha consumido un 80% del presupuesto cuando solo ha pasado un 80% del mes.',
      fecha: '2025-10-23',
      leida: false,
      emoji: '📊'
    },
    {
      id: 3,
      tipo: 'CASHFLOW_WARNING',
      severidad: 'Crítico',
      categoria: null,
      mensaje: '¡Alerta Importante! Tu flujo de caja necesita atención. Considera ajustar gastos o aumentar ingresos.',
      fecha: '2025-10-20',
      leida: true,
      emoji: '💰'
    }
  ])

  const [filtroSeveridad, setFiltroSeveridad] = useState('todas')

  const alertasFiltradas = alertas.filter(alerta => {
    if (filtroSeveridad === 'todas') return true
    return alerta.severidad.toLowerCase() === filtroSeveridad.toLowerCase()
  })

  const getSeveridadColor = (severidad) => {
    switch (severidad.toLowerCase()) {
      case 'crítico':
        return 'red'
      case 'alto':
        return 'orange'
      case 'medio':
        return 'yellow'
      case 'bajo':
        return 'blue'
      default:
        return 'gray'
    }
  }

  const contarPorSeveridad = (severidad) => {
    return alertas.filter(a => a.severidad.toLowerCase() === severidad.toLowerCase()).length
  }

  const formatearFecha = (fecha) => {
    const date = new Date(fecha)
    const hoy = new Date()
    const diffTime = Math.abs(hoy - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`
    return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Header con Resumen */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🚨 Centro de Alertas</h2>
        <p className="text-gray-600 mb-4">
          Recibe notificaciones importantes sobre tu negocio para tomar acción a tiempo.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{contarPorSeveridad('crítico')}</p>
            <p className="text-xs text-gray-600">Críticas</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">{contarPorSeveridad('alto')}</p>
            <p className="text-xs text-gray-600">Altas</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">{contarPorSeveridad('medio')}</p>
            <p className="text-xs text-gray-600">Medias</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{contarPorSeveridad('bajo')}</p>
            <p className="text-xs text-gray-600">Bajas</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">🔍 Filtrar por Severidad</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroSeveridad('todas')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroSeveridad === 'todas'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({alertas.length})
          </button>
          <button
            onClick={() => setFiltroSeveridad('crítico')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroSeveridad === 'crítico'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Críticas ({contarPorSeveridad('crítico')})
          </button>
          <button
            onClick={() => setFiltroSeveridad('alto')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroSeveridad === 'alto'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            Altas ({contarPorSeveridad('alto')})
          </button>
          <button
            onClick={() => setFiltroSeveridad('medio')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroSeveridad === 'medio'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            Medias ({contarPorSeveridad('medio')})
          </button>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-4">
        {alertasFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">🎉</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¡No hay alertas de este tipo!
            </h3>
            <p className="text-gray-600">
              Tu negocio está funcionando sin problemas en esta categoría.
            </p>
          </div>
        ) : (
          alertasFiltradas.map((alerta) => {
            const color = getSeveridadColor(alerta.severidad)
            return (
              <div
                key={alerta.id}
                className={`bg-white rounded-xl shadow-lg p-5 border-l-4 border-${color}-500 ${
                  alerta.leida ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <span className="text-3xl">{alerta.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${color}-100 text-${color}-700`}>
                          {alerta.severidad}
                        </span>
                        {alerta.categoria && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                            {alerta.categoria}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatearFecha(alerta.fecha)}
                        </span>
                      </div>
                      <p className="text-gray-900 leading-relaxed">{alerta.mensaje}</p>
                      <div className="mt-3 flex space-x-2">
                        <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                          Ver detalles →
                        </button>
                        {!alerta.leida && (
                          <button className="text-sm text-gray-500 hover:text-gray-700">
                            Marcar como leída
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Sección de Consejos */}
      {alertasFiltradas.some(a => a.severidad === 'Crítico' || a.severidad === 'Alto') && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">💡 ¿Qué puedes hacer?</h3>
          <ul className="space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-indigo-600 mt-1">1.</span>
              <span className="text-gray-700">
                <strong>Revisa tus gastos:</strong> Identifica áreas donde puedas reducir costos temporalmente.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-indigo-600 mt-1">2.</span>
              <span className="text-gray-700">
                <strong>Usa el simulador:</strong> Antes de hacer nuevos gastos, simula el impacto en tu negocio.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-indigo-600 mt-1">3.</span>
              <span className="text-gray-700">
                <strong>Busca nuevas oportunidades:</strong> Considera formas de aumentar tus ingresos.
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default PanelAlertas
