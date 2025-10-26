import { useState } from 'react'

// eslint-disable-next-line no-unused-vars
function Dashboard({ empresa }) {
  // Datos de ejemplo para el dashboard
  const [estadisticas] = useState({
    gastoMensual: 85000,
    ingresoMensual: 120000,
    mesesReserva: 8.5,
    presupuestos: {
      personal: { presupuesto: 180000, gastado: 145000, porcentaje: 80 },
      marketing: { presupuesto: 30000, gastado: 28500, porcentaje: 95 },
      operaciones: { presupuesto: 20000, gastado: 12000, porcentaje: 60 }
    }
  })

  const calcularSalud = () => {
    const balance = estadisticas.ingresoMensual - estadisticas.gastoMensual
    if (balance > 30000) return { estado: 'Excelente', color: 'green', emoji: '😄' }
    if (balance > 0) return { estado: 'Bueno', color: 'blue', emoji: '😊' }
    if (balance > -20000) return { estado: 'Precaución', color: 'yellow', emoji: '😐' }
    return { estado: 'Crítico', color: 'red', emoji: '😰' }
  }

  const salud = calcularSalud()

  return (
    <div className="space-y-6">
      {/* Tarjeta de Salud Financiera */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-600">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Estado de tu Negocio</h2>
          <span className="text-4xl">{salud.emoji}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">💰 Ingresos del Mes</p>
            <p className="text-2xl font-bold text-green-600">
              ${estadisticas.ingresoMensual.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">💸 Gastos del Mes</p>
            <p className="text-2xl font-bold text-red-600">
              ${estadisticas.gastoMensual.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">📈 Balance</p>
            <p className={`text-2xl font-bold ${
              estadisticas.ingresoMensual - estadisticas.gastoMensual > 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              ${(estadisticas.ingresoMensual - estadisticas.gastoMensual).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Indicador de Reserva de Efectivo */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">🏦 Reserva de Efectivo</h3>
            <p className="text-sm text-gray-600">¿Cuántos meses puedes operar sin ingresos?</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-indigo-600">{estadisticas.mesesReserva}</p>
            <p className="text-sm text-gray-600">meses</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${
              estadisticas.mesesReserva >= 6 
                ? 'bg-green-500' 
                : estadisticas.mesesReserva >= 3 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`}
            style={{ width: `${Math.min((estadisticas.mesesReserva / 12) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0 meses</span>
          <span>6 meses (recomendado)</span>
          <span>12 meses</span>
        </div>
      </div>

      {/* Presupuestos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Uso de Presupuestos</h3>
        <div className="space-y-4">
          {Object.entries(estadisticas.presupuestos).map(([categoria, datos]) => {
            const colorBarra = 
              datos.porcentaje >= 90 ? 'bg-red-500' :
              datos.porcentaje >= 70 ? 'bg-yellow-500' :
              'bg-green-500'
            
            const iconos = {
              personal: '👥',
              marketing: '📢',
              operaciones: '⚙️'
            }

            return (
              <div key={categoria} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{iconos[categoria]}</span>
                    <span className="font-medium text-gray-900 capitalize">{categoria}</span>
                  </div>
                  <span className={`text-sm font-semibold ${
                    datos.porcentaje >= 90 ? 'text-red-600' :
                    datos.porcentaje >= 70 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {datos.porcentaje}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${colorBarra}`}
                    style={{ width: `${datos.porcentaje}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Gastado: ${datos.gastado.toLocaleString()}</span>
                  <span>Presupuesto: ${datos.presupuesto.toLocaleString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Consejos Rápidos */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">💡 Consejos para ti</h3>
        <ul className="space-y-2">
          <li className="flex items-start space-x-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700">
              Tu reserva de efectivo está en buen nivel. ¡Sigue así!
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-yellow-500 mt-1">⚠</span>
            <span className="text-gray-700">
              El presupuesto de marketing está casi al límite. Considera revisarlo.
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 mt-1">ℹ</span>
            <span className="text-gray-700">
              Usa el simulador para planificar nuevas contrataciones o inversiones.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
