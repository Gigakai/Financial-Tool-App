import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, RadioGroup, Radio } from '@nextui-org/react'
import { useState } from 'react'
import { Calendar, FileText, Tag, TrendingUp, TrendingDown } from 'lucide-react'
import ApiService from '../../services/api'
import { API_CONFIG } from '../../utils/constants'

const AddExpenseModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'gasto',
    concept: '',
    category: '',
    amount: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const ingresoCategories = [
    { value: 'ventas', label: 'Ventas' }
  ]

  const gastoCategories = [
    { value: 'personal', label: 'Personal' },
    { value: 'infraestructura', label: 'Infraestructura' },
    { value: 'costos', label: 'Costos' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'marketing', label: 'Marketing' }
  ]

  const categories = formData.type === 'ingreso' ? ingresoCategories : gastoCategories

  const handleSubmit = async () => {
    if (!formData.concept || !formData.category || !formData.amount) {
      setError('Por favor completa todos los campos')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Convertir la fecha al formato que espera el backend (MM/DD/YYYY)
      const [year, month, day] = formData.date.split('-')
      const formattedDate = `${month}/${day}/${year}`

      // Preparar datos para la API
      const transactionData = {
        empresa_id: API_CONFIG.DEFAULT_EMPRESA_ID,
        fecha: formattedDate,
        tipo: formData.type, // 'ingreso' o 'gasto'
        concepto: formData.concept,
        categoria: formData.category,
        monto: formData.type === 'ingreso'
          ? Math.abs(Number(formData.amount))
          : Math.abs(Number(formData.amount))
      }

      // Llamar a la API
      const result = await ApiService.addTransaction(transactionData)

      if (result.success) {
        // Crear objeto para la UI local
        const newTransaction = {
          id: Date.now(),
          date: formData.date,
          concept: formData.concept,
          category: categories.find(c => c.value === formData.category)?.label || formData.category,
          amount: transactionData.monto,
          type: formData.type === 'ingreso' ? 'income' : 'expense'
        }

        onAdd(newTransaction)

        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          type: 'gasto',
          concept: '',
          category: '',
          amount: ''
        })

        onClose()
      } else {
        setError(result.message || 'Error al agregar la transacción')
      }
    } catch (err) {
      console.error('Error al agregar transacción:', err)
      setError(err.message || 'Error de conexión con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
      placement="center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  formData.type === 'ingreso' ? 'bg-positive/10' : 'bg-banorte-red/10'
                }`}>
                  {formData.type === 'ingreso' ? (
                    <TrendingUp size={20} className="text-positive" />
                  ) : (
                    <TrendingDown size={20} className="text-banorte-red" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-banorte-gray">
                    {formData.type === 'ingreso' ? 'Agregar Ingreso' : 'Agregar Gasto'}
                  </h3>
                  <p className="text-sm text-gray-500 font-normal">
                    Registra una nueva transacción
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="gap-4">
              {/* Mensaje de Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Tipo de Transacción */}
              <RadioGroup
                label="Tipo de transacción"
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value, category: '' })}
                orientation="horizontal"
                classNames={{
                  base: "w-full",
                  wrapper: "gap-4"
                }}
              >
                <Radio value="ingreso" description="Entrada de dinero">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-positive" />
                    <span>Ingreso</span>
                  </div>
                </Radio>
                <Radio value="gasto" description="Salida de dinero">
                  <div className="flex items-center gap-2">
                    <TrendingDown size={16} className="text-alert" />
                    <span>Gasto</span>
                  </div>
                </Radio>
              </RadioGroup>

              {/* Fecha */}
              <Input
                label="Fecha"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                startContent={<Calendar size={18} className="text-gray-400" />}
                variant="bordered"
                isRequired
              />

              {/* Concepto */}
              <Input
                label="Concepto"
                placeholder="Ej: Pago de servicios"
                value={formData.concept}
                onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                startContent={<FileText size={18} className="text-gray-400" />}
                variant="bordered"
                isRequired
              />

              {/* Categoría */}
              <Select
                label="Categoría"
                placeholder="Selecciona una categoría"
                selectedKeys={formData.category ? [formData.category] : []}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                startContent={<Tag size={18} className="text-gray-400" />}
                variant="bordered"
                isRequired
              >
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </Select>

              {/* Monto */}
              <Input
                label="Monto"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-gray-400 text-sm">$</span>
                  </div>
                }
                variant="bordered"
                isRequired
              />
            </ModalBody>
            <ModalFooter>
              <Button 
                variant="light" 
                onPress={onClose}
                isDisabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit}
                className={formData.type === 'ingreso' ? 'bg-positive' : 'bg-banorte-red'}
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Agregar'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default AddExpenseModal