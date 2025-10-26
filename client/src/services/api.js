// API Service para comunicación con el backend MCP
import { API_CONFIG } from '../utils/constants'

const API_BASE_URL = API_CONFIG.API_BASE_URL

class ApiService {
  // Método principal para comunicarse con el CFO Virtual
  async askCFO(prompt, empresaId = API_CONFIG.DEFAULT_EMPRESA_ID) {
    try {
      const response = await fetch(`${API_BASE_URL}/ask-cfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          empresa_id: empresaId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error calling CFO:', error)
      throw error
    }
  }

  // Verificar alertas proactivamente (Sentinela mejorado)
  async checkAlerts(empresaId = API_CONFIG.DEFAULT_EMPRESA_ID) {
    try {
      const response = await fetch(`${API_BASE_URL}/check-alerts/${empresaId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data // Retorna { alerts: [], summary: { total, critical, high, medium } }
    } catch (error) {
      console.error('Error checking alerts:', error)
      throw error
    }
  }

  // Agregar transacción
  async addTransaction(transactionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }

  // MÉTODOS LEGACY (mantener por compatibilidad si se usan en otros componentes)
  
  // Simulador de escenarios
  async simulateScenario(empresaId, description, recurringCost = 0, oneTimeCost = 0) {
    // Ahora usa el método askCFO
    const prompt = `${description}${recurringCost ? ` con costo mensual de $${recurringCost}` : ''}${oneTimeCost ? ` y costo inicial de $${oneTimeCost}` : ''}`
    return this.askCFO(prompt, empresaId)
  }

  // Resumen financiero
  async getFinancialSummary(empresaId, tipo, timePeriod = 'last_30_days', categoria = null) {
    let prompt = `Dame un resumen de ${tipo === 'ingreso' ? 'ingresos' : 'gastos'} de ${timePeriod === 'current_month' ? 'este mes' : 'los últimos 30 días'}`
    if (categoria) {
      prompt += ` en la categoría ${categoria}`
    }
    return this.askCFO(prompt, empresaId)
  }

  // Health Check
  async getHealthCheck(empresaId) {
    return this.askCFO('¿Cómo está mi salud financiera?', empresaId)
  }

  // Alertas (método legacy)
  async getAlerts(empresaId) {
    return this.askCFO('¿Tengo alguna alerta importante?', empresaId)
  }

  // Agregar transacción (REST API)
  async addTransaction(transactionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }
}

export default new ApiService()
