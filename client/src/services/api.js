// API Service para comunicación con el backend MCP

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class ApiService {
  // Simulador de escenarios
  async simulateScenario(empresaId, description, recurringCost = 0, oneTimeCost = 0) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empresa_id: empresaId,
          description,
          recurringCost,
          oneTimeCost,
        }),
      })
      return await response.json()
    } catch (error) {
      console.error('Error simulating scenario:', error)
      throw error
    }
  }

  // Resumen financiero
  async getFinancialSummary(empresaId, tipo, timePeriod = 'last_30_days', categoria = null, startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams({
        empresa_id: empresaId,
        tipo,
        timePeriod,
        ...(categoria && { categoria }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      })
      
      const response = await fetch(`${API_BASE_URL}/api/summary?${params}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching summary:', error)
      throw error
    }
  }

  // Health Check
  async getHealthCheck(empresaId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health/${empresaId}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching health check:', error)
      throw error
    }
  }

  // Alertas
  async getAlerts(empresaId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts/${empresaId}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching alerts:', error)
      throw error
    }
  }
}

export default new ApiService()
