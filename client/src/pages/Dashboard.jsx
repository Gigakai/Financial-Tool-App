import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Progress, Chip } from '@nextui-org/react'
import { 
  FileText, Activity, AlertTriangle, BarChart3, Target, 
  TrendingUp, TrendingDown, ArrowRight, Bot, Plus 
} from 'lucide-react'
import AddExpenseModal from '../components/expenses/AddExpenseModal'

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddTransaction = (newTransaction) => {
    console.log('Nueva transacción:', newTransaction)
    // Aquí puedes agregar la lógica para guardar la transacción
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* AI Chat Promo Banner - Mobile */}
      <div className="md:hidden bg-gradient-to-r from-banorte-red to-red-700 rounded-2xl p-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <Bot size={24} className="text-banorte-red" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">¡Pregúntame lo que quieras!</h3>
            <p className="text-xs opacity-90">Usa el chat de IA para análisis instantáneo</p>
          </div>
          <div className="animate-bounce">
            <ArrowRight size={24} className="rotate-90" />
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-banorte-gray">Dashboard</h1>
        </div>
        <Button 
          color="primary" 
          className="bg-banorte-red text-white w-full md:w-auto"
          size="sm"
          startContent={<Plus size={16} />}
          onPress={() => setIsModalOpen(true)}
        >
          Nueva Transacción
        </Button>
      </div>

      {/* Main Grid - 4 Cards - Mobile First */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Card 1: Financial Health */}
        <Card className="card-hover">
          <CardHeader className="flex justify-between">
            <div className="flex items-center gap-2">
              <Activity size={24} className="text-positive" />
              <h3 className="text-lg font-semibold">Financial Health</h3>
            </div>
            <Chip color="success" variant="flat">Saludable</Chip>
          </CardHeader>
          <CardBody className="gap-4">
            {/* Runway Meter */}
            <div className="flex flex-col items-center py-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#6CCC4A"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(8.5 / 12) * 351.86} 351.86`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-positive">8.5</span>
                  <span className="text-xs text-gray-500">meses</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Runway Restante</p>
            </div>

            {/* Status Badges */}
            <div className="flex gap-2 flex-wrap">
              <Chip size="sm" color="success" variant="flat">Budget: OK</Chip>
              <Chip size="sm" color="success" variant="flat">Cash Flow: ↑</Chip>
              <Chip size="sm" color="warning" variant="flat">1 Alerta</Chip>
            </div>

            <Button variant="bordered" fullWidth>Ver Detalles</Button>
          </CardBody>
        </Card>

        {/* Card 2: Alerts Center */}
        <Card className="card-hover">
          <CardHeader className="flex justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={24} className="text-alert" />
              <h3 className="text-lg font-semibold">Alerts Center</h3>
            </div>
            <Chip color="danger" variant="flat">3 Nuevas</Chip>
          </CardHeader>
          <CardBody className="gap-3">
            {/* Alert Items */}
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Presupuesto Excedido</p>
                <p className="text-xs text-gray-600">Marketing: 105% del presupuesto</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <AlertTriangle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Ritmo de Gasto Alto</p>
                <p className="text-xs text-gray-600">Operaciones: 85% en 80% del mes</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <TrendingDown size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Flujo de Caja</p>
                <p className="text-xs text-gray-600">Proyección negativa en 15 días</p>
              </div>
            </div>

            <Button color="danger" variant="flat" fullWidth>Ver Todas</Button>
          </CardBody>
        </Card>

        {/* Card 3: Financial Summary */}
        <Card className="card-hover">
          <CardHeader className="flex justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={24} className="text-banorte-red" />
              <h3 className="text-lg font-semibold">Financial Summary</h3>
            </div>
            <select className="text-sm border border-gray-300 rounded-lg px-2 py-1">
              <option>Este Mes</option>
              <option>Trimestre</option>
              <option>Año</option>
            </select>
          </CardHeader>
          <CardBody className="gap-4">
            {/* Income vs Expenses */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-positive" />
                    <span className="text-gray-600">Ingresos</span>
                  </div>
                  <span className="font-semibold text-positive">$850,000</span>
                </div>
                <Progress value={85} color="success" size="sm" />
              </div>

              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <TrendingDown size={16} className="text-banorte-red" />
                    <span className="text-gray-600">Gastos</span>
                  </div>
                  <span className="font-semibold text-banorte-red">$620,000</span>
                </div>
                <Progress value={62} color="danger" size="sm" />
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-semibold">Balance</span>
                  <span className="font-bold text-positive">+$230,000</span>
                </div>
              </div>
            </div>

            {/* Mini Chart Placeholder */}
            <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <BarChart3 size={32} />
            </div>
          </CardBody>
        </Card>

        {/* Card 4: Scenario Simulator */}
        <Card className="card-hover">
          <CardHeader className="flex items-center gap-2">
            <Target size={24} className="text-banorte-red" />
            <h3 className="text-lg font-semibold">Scenario Simulator</h3>
          </CardHeader>
          <CardBody className="gap-4">
            {/* Input */}
            <input
              type="text"
              placeholder="¿Qué pasaría si...?"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-banorte-red"
            />

            {/* Recent Scenarios */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Escenarios Recientes:</p>
              <div className="flex gap-2 flex-wrap">
                <Chip size="sm" variant="flat" className="cursor-pointer">
                  Contratar desarrollador
                </Chip>
                <Chip size="sm" variant="flat" className="cursor-pointer">
                  Nueva campaña
                </Chip>
              </div>
            </div>

            <Button 
              color="primary" 
              className="gradient-banorte text-white"
              size="lg"
              fullWidth
            >
              Nueva Simulación
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Add Transaction Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </div>
  )
}

export default Dashboard
