/**
 * Servicio de API para comunicarse con el servidor MCP
 * 
 * Este archivo contiene funciones preparadas para conectar
 * el frontend con el backend cuando estés listo.
 */

// URL base del servidor (ajustar según tu configuración)
const API_BASE_URL = 'http://localhost:3000' // Cambiar por tu URL real

/**
 * Simula un escenario financiero
 * Conecta con la herramienta 'simulateFinancialScenario' del servidor
 */
export async function simularEscenario(empresaId, datos) {
  try {
    // Ejemplo de cómo llamar al servidor MCP
    // Necesitarás implementar la comunicación según tu arquitectura
    
    const response = await fetch(`${API_BASE_URL}/api/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        empresa_id: empresaId,
        description: datos.descripcion,
        recurringCost: datos.costoRecurrente,
        oneTimeCost: datos.costoUnico
      })
    })

    if (!response.ok) {
      throw new Error('Error al simular escenario')
    }

    const resultado = await response.json()
    
    // Transformar la respuesta del servidor al formato esperado por el frontend
    return {
      nivelRiesgo: resultado.riskAnalysis.riskLevel,
      puntaje: resultado.riskAnalysis.score,
      mesesReserva: resultado.riskAnalysis.runwayMonths,
      explicacion: resultado.riskAnalysis.contextualExplanation,
      simulacion: {
        descripcion: resultado.simulationDescription,
        costoRecurrente: resultado.simulationCosts.recurringCost,
        costoUnico: resultado.simulationCosts.oneTimeCost
      }
    }
  } catch (error) {
    console.error('Error al simular escenario:', error)
    throw error
  }
}

/**
 * Obtiene alertas financieras para una empresa
 * Conecta con la herramienta 'checkForFinancialAlerts' del servidor
 */
export async function obtenerAlertas(empresaId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts/${empresaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error('Error al obtener alertas')
    }

    const alertas = await response.json()
    
    // Transformar alertas al formato del frontend
    return alertas.map(alerta => ({
      id: Math.random().toString(36).substr(2, 9), // Generar ID único
      tipo: alerta.type,
      severidad: alerta.severity,
      categoria: alerta.category || null,
      mensaje: alerta.message,
      fecha: new Date().toISOString().split('T')[0],
      leida: false,
      emoji: obtenerEmojiParaTipo(alerta.type)
    }))
  } catch (error) {
    console.error('Error al obtener alertas:', error)
    throw error
  }
}

/**
 * Obtiene el resumen financiero de una empresa
 * Esta función necesitará una nueva herramienta en el servidor
 */
export async function obtenerResumenFinanciero(empresaId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/summary/${empresaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error('Error al obtener resumen financiero')
    }

    const resumen = await response.json()
    
    return {
      gastoMensual: resumen.monthlyExpenses,
      ingresoMensual: resumen.monthlyIncome,
      mesesReserva: resumen.runwayMonths,
      efectivoActual: resumen.currentCash,
      presupuestos: resumen.budgets
    }
  } catch (error) {
    console.error('Error al obtener resumen:', error)
    throw error
  }
}

/**
 * Obtiene información de la empresa
 */
export async function obtenerInfoEmpresa(empresaId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/company/${empresaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error('Error al obtener información de empresa')
    }

    const empresa = await response.json()
    
    return {
      id: empresa.empresa_id,
      nombre: empresa.companyName,
      descripcion: empresa.description,
      efectivo: empresa.currentCash,
      industria: empresa.industry,
      riesgo: empresa.riskProfile
    }
  } catch (error) {
    console.error('Error al obtener info de empresa:', error)
    throw error
  }
}

// Funciones auxiliares

function obtenerEmojiParaTipo(tipo) {
  const emojis = {
    'BUDGET_EXCEEDED': '⚠️',
    'PACING_WARNING': '📊',
    'CASHFLOW_WARNING': '💰',
    'DEFAULT': '📢'
  }
  return emojis[tipo] || emojis['DEFAULT']
}

/**
 * Hook personalizado de React para manejar simulaciones
 * Uso:
 * 
 * const { simular, cargando, resultado, error } = useSimulador('E001')
 * 
 * await simular({ 
 *   descripcion: 'Contratar empleado',
 *   costoRecurrente: 50000,
 *   costoUnico: 15000
 * })
 */
export function useSimulador(empresaId) {
  const [cargando, setCargando] = React.useState(false)
  const [resultado, setResultado] = React.useState(null)
  const [error, setError] = React.useState(null)

  const simular = async (datos) => {
    setCargando(true)
    setError(null)
    try {
      const res = await simularEscenario(empresaId, datos)
      setResultado(res)
      return res
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setCargando(false)
    }
  }

  return { simular, cargando, resultado, error }
}

/**
 * Hook para obtener alertas
 * Uso:
 * 
 * const { alertas, cargando, actualizar } = useAlertas('E001')
 */
export function useAlertas(empresaId) {
  const [cargando, setCargando] = React.useState(false)
  const [alertas, setAlertas] = React.useState([])
  const [error, setError] = React.useState(null)

  const actualizar = async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await obtenerAlertas(empresaId)
      setAlertas(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setCargando(false)
    }
  }

  // Cargar alertas al montar el componente
  React.useEffect(() => {
    if (empresaId) {
      actualizar()
    }
  }, [empresaId])

  return { alertas, cargando, error, actualizar }
}

/**
 * Hook para dashboard
 * Uso:
 * 
 * const { resumen, cargando, actualizar } = useDashboard('E001')
 */
export function useDashboard(empresaId) {
  const [cargando, setCargando] = React.useState(false)
  const [resumen, setResumen] = React.useState(null)
  const [error, setError] = React.useState(null)

  const actualizar = async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await obtenerResumenFinanciero(empresaId)
      setResumen(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setCargando(false)
    }
  }

  React.useEffect(() => {
    if (empresaId) {
      actualizar()
    }
  }, [empresaId])

  return { resumen, cargando, error, actualizar }
}

// NOTA: Importar React cuando uses los hooks
// import React from 'react'

/**
 * EJEMPLO DE USO EN UN COMPONENTE:
 * 
 * import { useSimulador } from './services/api'
 * 
 * function SimuladorComponent() {
 *   const { simular, cargando, resultado } = useSimulador('E001')
 * 
 *   const handleSimular = async () => {
 *     await simular({
 *       descripcion: 'Contratar desarrollador',
 *       costoRecurrente: 50000,
 *       costoUnico: 15000
 *     })
 *   }
 * 
 *   return (
 *     <div>
 *       <button onClick={handleSimular} disabled={cargando}>
 *         {cargando ? 'Simulando...' : 'Simular'}
 *       </button>
 *       {resultado && <div>Riesgo: {resultado.nivelRiesgo}</div>}
 *     </div>
 *   )
 * }
 */
