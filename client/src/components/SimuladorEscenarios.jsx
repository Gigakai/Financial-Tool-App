import { useState } from 'react'

function SimuladorEscenarios({ empresa }) {
  const [descripcion, setDescripcion] = useState('')
  const [costoRecurrente, setCostoRecurrente] = useState('')
  const [costoUnico, setCostoUnico] = useState('')
  const [resultadoSimulacion, setResultadoSimulacion] = useState(null)
  const [escenarioSeleccionado, setEscenarioSeleccionado] = useState(null)

  // Escenarios pre-definidos para facilitar el uso
  const escenariosComunes = [
    {
      id: 1,
      titulo: '👨‍💼 Contratar un Empleado',
      descripcion: 'Contratar un nuevo empleado de tiempo completo',
      costoRecurrente: 50000,
      costoUnico: 15000,
      emoji: '👨‍💼',
      explicacion: 'Incluye salario mensual y costo de contratación/capacitación'
    },
    {
      id: 2,
      titulo: '📢 Campaña de Marketing',
      descripcion: 'Lanzar una campaña de marketing digital',
      costoRecurrente: 20000,
      costoUnico: 50000,
      emoji: '📢',
      explicacion: 'Inversión inicial en campaña y mantenimiento mensual'
    },
    {
      id: 3,
      titulo: '🖥️ Comprar Equipo',
      descripcion: 'Adquirir nuevo equipo tecnológico',
      costoRecurrente: 2000,
      costoUnico: 100000,
      emoji: '🖥️',
      explicacion: 'Costo de compra y mantenimiento mensual'
    },
    {
      id: 4,
      titulo: '🏢 Expandir Oficina',
      descripcion: 'Rentar una oficina más grande',
      costoRecurrente: 35000,
      costoUnico: 70000,
      emoji: '🏢',
      explicacion: 'Depósito inicial y renta mensual aumentada'
    }
  ]

  const seleccionarEscenario = (escenario) => {
    setEscenarioSeleccionado(escenario.id)
    setDescripcion(escenario.descripcion)
    setCostoRecurrente(escenario.costoRecurrente.toString())
    setCostoUnico(escenario.costoUnico.toString())
    setResultadoSimulacion(null)
  }

  const limpiarFormulario = () => {
    setDescripcion('')
    setCostoRecurrente('')
    setCostoUnico('')
    setResultadoSimulacion(null)
    setEscenarioSeleccionado(null)
  }

  const simularEscenario = () => {
    // Simulación local de ejemplo (en producción llamarías a la API)
    const costoRec = parseFloat(costoRecurrente) || 0
    const costoUnic = parseFloat(costoUnico) || 0
    
    const gastoMensualActual = 85000
    const nuevoGastoMensual = gastoMensualActual + costoRec
    const efectivoDespues = empresa.efectivo - costoUnic
    const mesesReserva = efectivoDespues / nuevoGastoMensual

    let nivelRiesgo, puntaje, color, emoji, recomendacion
    
    if (mesesReserva >= 9) {
      nivelRiesgo = 'Bajo'
      puntaje = 9
      color = 'green'
      emoji = '✅'
      recomendacion = '¡Excelente! Esta decisión mantiene tu negocio muy seguro.'
    } else if (mesesReserva >= 6) {
      nivelRiesgo = 'Moderado'
      puntaje = 6
      color = 'blue'
      emoji = '👍'
      recomendacion = 'Es una decisión razonable. Tu negocio seguirá estable.'
    } else if (mesesReserva >= 3) {
      nivelRiesgo = 'Alto'
      puntaje = 3
      color = 'yellow'
      emoji = '⚠️'
      recomendacion = 'Ten cuidado. Esta decisión reduce significativamente tu margen de seguridad.'
    } else {
      nivelRiesgo = 'Crítico'
      puntaje = 1
      color = 'red'
      emoji = '🚨'
      recomendacion = '¡Alto! Esta decisión es muy arriesgada. Busca otras opciones.'
    }

    setResultadoSimulacion({
      nivelRiesgo,
      puntaje,
      color,
      emoji,
      mesesReserva: mesesReserva.toFixed(1),
      efectivoDespues,
      nuevoGastoMensual,
      recomendacion
    })
  }

  return (
    <div className="space-y-6">
      {/* Título e Instrucciones */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🔮 Simulador de Decisiones</h2>
        <p className="text-gray-600">
          ¿Estás pensando en hacer un gasto importante? Simula el impacto en tu negocio antes de decidir.
        </p>
      </div>

      {/* Escenarios Comunes */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Escenarios Comunes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escenariosComunes.map((escenario) => (
            <button
              key={escenario.id}
              onClick={() => seleccionarEscenario(escenario)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                escenarioSeleccionado === escenario.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300 bg-white'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-3xl">{escenario.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{escenario.titulo}</h4>
                  <p className="text-xs text-gray-500 mt-1">{escenario.explicacion}</p>
                  <div className="flex space-x-4 mt-2 text-xs">
                    <span className="text-orange-600">
                      💵 ${escenario.costoUnico.toLocaleString()} inicial
                    </span>
                    <span className="text-blue-600">
                      🔄 ${escenario.costoRecurrente.toLocaleString()}/mes
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Formulario Personalizado */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">✏️ O Crea tu Propio Escenario</h3>
          {(descripcion || costoRecurrente || costoUnico) && (
            <button
              onClick={limpiarFormulario}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              🔄 Limpiar
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 ¿Qué estás considerando hacer?
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Contratar un diseñador gráfico"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💵 Costo Único (una sola vez)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={costoUnico}
                  onChange={(e) => setCostoUnico(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ej: Compra de equipo, depósito, inversión inicial
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔄 Costo Mensual Recurrente
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={costoRecurrente}
                  onChange={(e) => setCostoRecurrente(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ej: Salario, renta, suscripción mensual
              </p>
            </div>
          </div>

          <button
            onClick={simularEscenario}
            disabled={!descripcion}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            🔍 Simular Impacto
          </button>
        </div>
      </div>

      {/* Resultado de la Simulación */}
      {resultadoSimulacion && (
        <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${resultadoSimulacion.color}-500`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">📊 Resultado de la Simulación</h3>
            <span className="text-4xl">{resultadoSimulacion.emoji}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`bg-${resultadoSimulacion.color}-50 rounded-lg p-4`}>
              <p className="text-sm text-gray-600 mb-1">Nivel de Riesgo</p>
              <p className={`text-2xl font-bold text-${resultadoSimulacion.color}-600`}>
                {resultadoSimulacion.nivelRiesgo}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Puntuación: {resultadoSimulacion.puntaje}/10
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Reserva después</p>
              <p className="text-2xl font-bold text-blue-600">
                {resultadoSimulacion.mesesReserva} meses
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Efectivo: ${(resultadoSimulacion.efectivoDespues / 1000000).toFixed(1)}M
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Gasto Mensual</p>
              <p className="text-2xl font-bold text-purple-600">
                ${resultadoSimulacion.nuevoGastoMensual.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                +${parseFloat(costoRecurrente || 0).toLocaleString()} nuevo
              </p>
            </div>
          </div>

          <div className={`bg-${resultadoSimulacion.color}-50 rounded-lg p-4`}>
            <p className="font-medium text-gray-900 mb-2">💬 Recomendación:</p>
            <p className="text-gray-700">{resultadoSimulacion.recomendacion}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimuladorEscenarios
