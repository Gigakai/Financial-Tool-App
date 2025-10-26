import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Input, Select, SelectItem, Slider, Divider, Chip, Progress } from '@nextui-org/react'
import { Target, Play, RotateCcw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, DollarSign, Percent, Calendar } from 'lucide-react'

const Simulator = () => {
  const [scenario, setScenario] = useState({
    type: 'revenue_increase',
    percentage: 15,
    duration: 6,
    additionalCost: 0
  })
  const [simulationResult, setSimulationResult] = useState(null)

  const scenarioTypes = [
    { value: 'revenue_increase', label: 'Incremento de Ingresos', icon: TrendingUp },
    { value: 'revenue_decrease', label: 'Disminución de Ingresos', icon: TrendingDown },
    { value: 'cost_reduction', label: 'Reducción de Costos', icon: Target },
    { value: 'cost_increase', label: 'Aumento de Costos', icon: AlertTriangle },
  ]

  const handleSimulate = () => {
    // Simulación de resultados
    const baseRevenue = 500000
    const baseCosts = 350000
    const baseRunway = 12

    let newRevenue = baseRevenue
    let newCosts = baseCosts
    let impact = 0

    switch (scenario.type) {
      case 'revenue_increase':
        newRevenue = baseRevenue * (1 + scenario.percentage / 100)
        impact = ((newRevenue - baseRevenue) / baseRevenue) * 100
        break
      case 'revenue_decrease':
        newRevenue = baseRevenue * (1 - scenario.percentage / 100)
        impact = ((newRevenue - baseRevenue) / baseRevenue) * 100
        break
      case 'cost_reduction':
        newCosts = baseCosts * (1 - scenario.percentage / 100)
        impact = ((baseCosts - newCosts) / baseCosts) * 100
        break
      case 'cost_increase':
        newCosts = baseCosts * (1 + scenario.percentage / 100)
        impact = ((newCosts - baseCosts) / baseCosts) * 100
        break
    }

    const newNetIncome = newRevenue - newCosts
    const baseNetIncome = baseRevenue - baseCosts
    const newRunway = baseRunway + (impact > 0 ? 3 : -2)

    setSimulationResult({
      baseRevenue,
      newRevenue,
      baseCosts,
      newCosts,
      baseNetIncome,
      newNetIncome,
      baseRunway,
      newRunway,
      impact: Math.abs(impact),
      isPositive: impact > 0
    })
  }

  const handleReset = () => {
    setScenario({
      type: 'revenue_increase',
      percentage: 15,
      duration: 6,
      additionalCost: 0
    })
    setSimulationResult(null)
  }

  const selectedScenarioType = scenarioTypes.find(s => s.value === scenario.type)
  const ScenarioIcon = selectedScenarioType?.icon || Target

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-banorte-gray">Simulador de Escenarios</h1>
        <p className="text-gray-500 mt-2">Proyecta el impacto de decisiones financieras</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración */}
        <Card className="border border-gray-200">
          <CardHeader className="flex gap-3 bg-gray-50 border-b">
            <div className="w-10 h-10 bg-banorte-red/10 rounded-full flex items-center justify-center">
              <Target size={20} className="text-banorte-red" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-bold text-banorte-gray">Configurar Escenario</p>
              <p className="text-sm text-gray-500">Define los parámetros de simulación</p>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-6">
            {/* Tipo de Escenario */}
            <div>
              <label className="text-sm font-semibold text-banorte-gray mb-2 block">
                Tipo de Escenario
              </label>
              <Select
                selectedKeys={[scenario.type]}
                onChange={(e) => setScenario({ ...scenario, type: e.target.value })}
                startContent={<ScenarioIcon size={18} />}
              >
                {scenarioTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Porcentaje */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-banorte-gray">
                  Porcentaje de Cambio
                </label>
                <Chip size="sm" variant="flat" color="primary" startContent={<Percent size={14} />}>
                  {scenario.percentage}%
                </Chip>
              </div>
              <Slider
                size="sm"
                step={1}
                minValue={0}
                maxValue={50}
                value={scenario.percentage}
                onChange={(value) => setScenario({ ...scenario, percentage: value })}
                className="max-w-full"
                color="danger"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Duración */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-banorte-gray">
                  Duración (meses)
                </label>
                <Chip size="sm" variant="flat" color="secondary" startContent={<Calendar size={14} />}>
                  {scenario.duration} meses
                </Chip>
              </div>
              <Slider
                size="sm"
                step={1}
                minValue={1}
                maxValue={24}
                value={scenario.duration}
                onChange={(value) => setScenario({ ...scenario, duration: value })}
                className="max-w-full"
                color="secondary"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 mes</span>
                <span>24 meses</span>
              </div>
            </div>

            {/* Costo Adicional */}
            <div>
              <Input
                label="Costo Adicional (opcional)"
                placeholder="0"
                type="number"
                value={scenario.additionalCost}
                onChange={(e) => setScenario({ ...scenario, additionalCost: Number(e.target.value) })}
                startContent={<DollarSign size={18} className="text-gray-400" />}
              />
            </div>

            <Divider />

            {/* Botones */}
            <div className="flex gap-3">
              <Button
                color="primary"
                className="flex-1 bg-banorte-red"
                startContent={<Play size={18} />}
                onPress={handleSimulate}
              >
                Simular
              </Button>
              <Button
                variant="bordered"
                startContent={<RotateCcw size={18} />}
                onPress={handleReset}
              >
                Reiniciar
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Resultados */}
        <Card className="border border-gray-200">
          <CardHeader className="flex gap-3 bg-gray-50 border-b">
            <div className="w-10 h-10 bg-positive/10 rounded-full flex items-center justify-center">
              <TrendingUp size={20} className="text-positive" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-bold text-banorte-gray">Resultados Proyectados</p>
              <p className="text-sm text-gray-500">Impacto financiero estimado</p>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            {!simulationResult ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Target size={40} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  Configura y ejecuta una simulación
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Los resultados aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Indicador de Impacto */}
                <Card className={`border-2 ${simulationResult.isPositive ? 'border-positive bg-green-50' : 'border-alert bg-red-50'}`}>
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {simulationResult.isPositive ? (
                          <CheckCircle2 size={32} className="text-positive" />
                        ) : (
                          <AlertTriangle size={32} className="text-alert" />
                        )}
                        <div>
                          <p className="text-sm text-gray-600">Impacto Proyectado</p>
                          <p className={`text-2xl font-bold ${simulationResult.isPositive ? 'text-positive' : 'text-alert'}`}>
                            {simulationResult.isPositive ? '+' : '-'}{simulationResult.impact.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <Chip
                        color={simulationResult.isPositive ? 'success' : 'danger'}
                        variant="flat"
                        size="lg"
                      >
                        {simulationResult.isPositive ? 'Positivo' : 'Negativo'}
                      </Chip>
                    </div>
                  </CardBody>
                </Card>

                {/* Métricas Comparativas */}
                <div className="space-y-4">
                  {/* Ingresos */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-banorte-gray">Ingresos Mensuales</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">${simulationResult.baseRevenue.toLocaleString()}</span>
                        <span className="text-xs text-gray-400">→</span>
                        <span className={`text-sm font-bold ${simulationResult.newRevenue > simulationResult.baseRevenue ? 'text-positive' : 'text-alert'}`}>
                          ${simulationResult.newRevenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={(simulationResult.newRevenue / simulationResult.baseRevenue) * 100}
                      className="max-w-full"
                      color={simulationResult.newRevenue > simulationResult.baseRevenue ? 'success' : 'danger'}
                    />
                  </div>

                  {/* Costos */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-banorte-gray">Costos Mensuales</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">${simulationResult.baseCosts.toLocaleString()}</span>
                        <span className="text-xs text-gray-400">→</span>
                        <span className={`text-sm font-bold ${simulationResult.newCosts < simulationResult.baseCosts ? 'text-positive' : 'text-alert'}`}>
                          ${simulationResult.newCosts.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={(simulationResult.newCosts / simulationResult.baseCosts) * 100}
                      className="max-w-full"
                      color={simulationResult.newCosts < simulationResult.baseCosts ? 'success' : 'danger'}
                    />
                  </div>

                  {/* Ingreso Neto */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-banorte-gray">Ingreso Neto</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">${simulationResult.baseNetIncome.toLocaleString()}</span>
                        <span className="text-xs text-gray-400">→</span>
                        <span className={`text-sm font-bold ${simulationResult.newNetIncome > simulationResult.baseNetIncome ? 'text-positive' : 'text-alert'}`}>
                          ${simulationResult.newNetIncome.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={(simulationResult.newNetIncome / simulationResult.baseNetIncome) * 100}
                      className="max-w-full"
                      color={simulationResult.newNetIncome > simulationResult.baseNetIncome ? 'success' : 'danger'}
                    />
                  </div>

                  {/* Runway */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-banorte-gray">Runway Proyectado</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{simulationResult.baseRunway} meses</span>
                        <span className="text-xs text-gray-400">→</span>
                        <span className={`text-sm font-bold ${simulationResult.newRunway > simulationResult.baseRunway ? 'text-positive' : 'text-alert'}`}>
                          {simulationResult.newRunway} meses
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={(simulationResult.newRunway / 24) * 100}
                      className="max-w-full"
                      color={simulationResult.newRunway > simulationResult.baseRunway ? 'success' : 'warning'}
                    />
                  </div>
                </div>

                {/* Recomendación */}
                <Card className="bg-blue-50 border border-blue-200">
                  <CardBody className="p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">💡 Recomendación</p>
                    <p className="text-sm text-blue-700">
                      {simulationResult.isPositive
                        ? 'Este escenario muestra un impacto positivo en tu salud financiera. Considera implementar esta estrategia.'
                        : 'Este escenario podría afectar negativamente tus finanzas. Evalúa alternativas o medidas de mitigación.'}
                    </p>
                  </CardBody>
                </Card>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default Simulator
