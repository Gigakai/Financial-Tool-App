import { useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import SimuladorEscenarios from './components/SimuladorEscenarios'
import PanelAlertas from './components/PanelAlertas'

function App() {
  const [vistaActual, setVistaActual] = useState('dashboard')
  const [empresaSeleccionada] = useState({
    id: 'E001',
    nombre: 'Tech Innovators',
    efectivo: 250000000,
    riesgo: 'Medium'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">💼</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mi Asistente Financiero</h1>
                <p className="text-sm text-gray-600">{empresaSeleccionada.nombre}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Efectivo disponible</p>
                <p className="text-lg font-bold text-green-600">
                  ${(empresaSeleccionada.efectivo / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            <button
              onClick={() => setVistaActual('dashboard')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                vistaActual === 'dashboard'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Mi Negocio
            </button>
            <button
              onClick={() => setVistaActual('simulador')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                vistaActual === 'simulador'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔮 Simular Decisión
            </button>
            <button
              onClick={() => setVistaActual('alertas')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                vistaActual === 'alertas'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🚨 Alertas
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {vistaActual === 'dashboard' && <Dashboard empresa={empresaSeleccionada} />}
        {vistaActual === 'simulador' && <SimuladorEscenarios empresa={empresaSeleccionada} />}
        {vistaActual === 'alertas' && <PanelAlertas empresa={empresaSeleccionada} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Tu asistente financiero inteligente para tomar mejores decisiones 💡
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
