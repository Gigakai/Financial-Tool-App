import { useState } from 'react'
import { Card, CardBody, Button, Input, Select, SelectItem, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react'
import { FileText, TrendingUp, TrendingDown, Search, Download, Calendar, Filter, DollarSign, Plus } from 'lucide-react'
import AddExpenseModal from '../components/expenses/AddExpenseModal'

const Summary = () => {
  const [dateRange, setDateRange] = useState('30')
  const [category, setCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Datos de ejemplo
  const [transactions, setTransactions] = useState([
    { id: 1, date: '2024-10-25', concept: 'Pago a proveedor XYZ', category: 'Servicios', amount: -15000, type: 'expense' },
    { id: 2, date: '2024-10-24', concept: 'Venta producto A', category: 'Ventas', amount: 45000, type: 'income' },
    { id: 3, date: '2024-10-23', concept: 'Nómina operativa', category: 'Personal', amount: -85000, type: 'expense' },
    { id: 4, date: '2024-10-22', concept: 'Venta producto B', category: 'Ventas', amount: 30000, type: 'income' },
    { id: 5, date: '2024-10-21', concept: 'Compra de equipo', category: 'Infraestructura', amount: -25000, type: 'expense' },
    { id: 6, date: '2024-10-20', concept: 'Materia prima', category: 'Costos', amount: -12000, type: 'expense' },
    { id: 7, date: '2024-10-19', concept: 'Campaña digital', category: 'Marketing', amount: -8000, type: 'expense' },
    { id: 8, date: '2024-10-18', concept: 'Servicios cloud', category: 'Servicios', amount: -3500, type: 'expense' },
  ])

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'ventas', label: 'Ventas' },
    { value: 'personal', label: 'Personal' },
    { value: 'infraestructura', label: 'Infraestructura' },
    { value: 'costos', label: 'Costos' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'marketing', label: 'Marketing' },
  ]

  const handleAddTransaction = (newTransaction) => {
    setTransactions([newTransaction, ...transactions])
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const netBalance = totalIncome - totalExpense

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-banorte-gray">Resumen Financiero</h1>
          <p className="text-gray-500 mt-2">Vista detallada de transacciones y reportes</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ingresos Totales</p>
                <p className="text-2xl font-bold text-positive mt-1">${totalIncome.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp size={16} className="text-positive" />
                  <span className="text-sm text-positive">+12.5%</span>
                  <span className="text-xs text-gray-400">vs mes anterior</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp size={24} className="text-positive" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-gray-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gastos Totales</p>
                <p className="text-2xl font-bold text-alert mt-1">${totalExpense.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown size={16} className="text-alert" />
                  <span className="text-sm text-alert">+8.3%</span>
                  <span className="text-xs text-gray-400">vs mes anterior</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown size={24} className="text-alert" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-gray-200 bg-gradient-to-br from-banorte-red to-red-700">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Balance Neto</p>
                <p className="text-2xl font-bold text-white mt-1">${netBalance.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <DollarSign size={16} className="text-white" />
                  <span className="text-sm text-white">Flujo positivo</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FileText size={24} className="text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar transacciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search size={18} className="text-gray-400" />}
              className="flex-1"
            />
            <Select
              label="Rango de fechas"
              selectedKeys={[dateRange]}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full md:w-48"
              startContent={<Calendar size={18} />}
            >
              <SelectItem key="7" value="7">Últimos 7 días</SelectItem>
              <SelectItem key="30" value="30">Últimos 30 días</SelectItem>
              <SelectItem key="90" value="90">Últimos 90 días</SelectItem>
              <SelectItem key="365" value="365">Último año</SelectItem>
            </Select>
            <Select
              label="Categoría"
              selectedKeys={[category]}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full md:w-48"
              startContent={<Filter size={18} />}
            >
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </Select>
            <Button
              color="primary"
              startContent={<Download size={18} />}
              className="bg-banorte-red"
            >
              Exportar
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Transactions Table */}
        <Button
          color="primary"
          className="bg-banorte-red"
          startContent={<Plus size={18} />}
          onPress={() => setIsModalOpen(true)}
        >
          Nueva Transacción
        </Button>
      <Card className="border border-gray-200">
        <CardBody className="p-0">
          <Table aria-label="Tabla de transacciones" removeWrapper>
            <TableHeader>
              <TableColumn>FECHA</TableColumn>
              <TableColumn>CONCEPTO</TableColumn>
              <TableColumn>CATEGORÍA</TableColumn>
              <TableColumn align="end">MONTO</TableColumn>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm">{transaction.date}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-banorte-gray">{transaction.concept}</p>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={transaction.type === 'income' ? 'success' : 'default'}
                    >
                      {transaction.category}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end items-center gap-2">
                      {transaction.type === 'income' ? (
                        <TrendingUp size={16} className="text-positive" />
                      ) : (
                        <TrendingDown size={16} className="text-alert" />
                      )}
                      <span className={`font-bold ${transaction.type === 'income' ? 'text-positive' : 'text-alert'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-banorte-gray">{transactions.length}</p>
            <p className="text-sm text-gray-500 mt-1">Transacciones</p>
          </CardBody>
        </Card>
        <Card className="border border-gray-200">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-positive">
              {transactions.filter(t => t.type === 'income').length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Ingresos</p>
          </CardBody>
        </Card>
        <Card className="border border-gray-200">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-alert">
              {transactions.filter(t => t.type === 'expense').length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Gastos</p>
          </CardBody>
        </Card>
        <Card className="border border-gray-200">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-warning">4</p>
            <p className="text-sm text-gray-500 mt-1">Categorías</p>
          </CardBody>
        </Card>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </div>
  )
}

export default Summary
