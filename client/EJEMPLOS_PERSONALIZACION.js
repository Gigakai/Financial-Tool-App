/**
 * EJEMPLOS DE PERSONALIZACIÓN
 * 
 * Este archivo contiene ejemplos prácticos de cómo personalizar
 * y extender la interfaz según tus necesidades.
 */

// ============================================================
// EJEMPLO 1: Agregar un nuevo escenario al simulador
// ============================================================

/*
En client/src/utils/constantes.js, agrega al array ESCENARIOS_PREDEFINIDOS:

{
  id: 7,
  titulo: '🎓 Programa de Becas',
  descripcion: 'Implementar programa de becas para empleados',
  costoRecurrente: 10000,
  costoUnico: 5000,
  emoji: '🎓',
  explicacion: 'Inversión en desarrollo de talento interno',
  categoria: 'personal'
}
*/

// ============================================================
// EJEMPLO 2: Cambiar los colores de tu marca
// ============================================================

/*
En client/tailwind.config.js:

module.exports = {
  theme: {
    extend: {
      colors: {
        'marca-principal': '#FF6B6B',     // Tu color principal
        'marca-secundario': '#4ECDC4',    // Tu color secundario
        'marca-acento': '#FFE66D',        // Color de acento
      }
    }
  }
}

Luego en tus componentes usa:
bg-marca-principal
text-marca-secundario
border-marca-acento
*/

// ============================================================
// EJEMPLO 3: Agregar un gráfico de tendencias
// ============================================================

/*
Primero instala:
npm install recharts

Luego crea un nuevo componente:
*/

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function GraficoTendencias() {
  const datos = [
    { mes: 'Ene', ingresos: 100000, gastos: 80000 },
    { mes: 'Feb', ingresos: 110000, gastos: 82000 },
    { mes: 'Mar', ingresos: 115000, gastos: 85000 },
    { mes: 'Abr', ingresos: 120000, gastos: 85000 },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        📈 Tendencia de Ingresos vs Gastos
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip 
            formatter={(value) => `$${value.toLocaleString()}`}
            contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="ingresos" 
            stroke="#10b981" 
            strokeWidth={3}
            name="Ingresos"
          />
          <Line 
            type="monotone" 
            dataKey="gastos" 
            stroke="#ef4444" 
            strokeWidth={3}
            name="Gastos"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ============================================================
// EJEMPLO 4: Crear un nuevo tab de "Reportes"
// ============================================================

/*
1. Crea el componente en components/Reportes.jsx:
*/

export function Reportes({ empresa }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          📄 Reportes Mensuales
        </h2>
        {/* Tu contenido aquí */}
      </div>
    </div>
  )
}

/*
2. En App.jsx, agrega:

import Reportes from './components/Reportes'

// En el estado:
const [vistaActual, setVistaActual] = useState('dashboard')

// En la navegación:
<button onClick={() => setVistaActual('reportes')}>
  📄 Reportes
</button>

// En el contenido:
{vistaActual === 'reportes' && <Reportes empresa={empresaSeleccionada} />}
*/

// ============================================================
// EJEMPLO 5: Agregar notificaciones toast
// ============================================================

/*
Instala:
npm install react-hot-toast

En App.jsx:
*/

import toast, { Toaster } from 'react-hot-toast'

function App() {
  const notificarExito = () => {
    toast.success('¡Simulación completada!', {
      icon: '✅',
      style: {
        border: '1px solid #10b981',
        padding: '16px',
      },
    })
  }

  return (
    <>
      <Toaster position="top-right" />
      {/* resto de tu app */}
    </>
  )
}

// ============================================================
// EJEMPLO 6: Conectar un componente con el backend real
// ============================================================

/*
En SimuladorEscenarios.jsx, reemplaza la simulación local:
*/

import { simularEscenario } from '../services/api'

const simularEscenarioReal = async () => {
  try {
    setSimulando(true)
    
    const resultado = await simularEscenario(empresa.id, {
      descripcion: descripcion,
      costoRecurrente: parseFloat(costoRecurrente) || 0,
      costoUnico: parseFloat(costoUnico) || 0
    })
    
    // Transformar resultado para la UI
    setResultadoSimulacion({
      nivelRiesgo: resultado.nivelRiesgo,
      puntaje: resultado.puntaje,
      mesesReserva: resultado.mesesReserva,
      // ... resto de los datos
    })
    
    toast.success('Simulación completada')
  } catch (error) {
    toast.error('Error al simular: ' + error.message)
  } finally {
    setSimulando(false)
  }
}

// ============================================================
// EJEMPLO 7: Agregar modo oscuro
// ============================================================

/*
1. En App.jsx, agrega estado:
*/

const [modoOscuro, setModoOscuro] = useState(false)

useEffect(() => {
  if (modoOscuro) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, [modoOscuro])

// Botón de toggle en el header:
<button 
  onClick={() => setModoOscuro(!modoOscuro)}
  className="p-2 rounded-lg hover:bg-gray-100"
>
  {modoOscuro ? '☀️' : '🌙'}
</button>

/*
2. En tailwind.config.js:
*/
module.exports = {
  darkMode: 'class',
  // ... resto de config
}

/*
3. Usa clases dark: en tus componentes:
*/
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  {/* contenido */}
</div>

// ============================================================
// EJEMPLO 8: Agregar búsqueda de alertas
// ============================================================

/*
En PanelAlertas.jsx:
*/

const [busqueda, setBusqueda] = useState('')

const alertasFiltradas = alertas.filter(alerta => {
  const cumpleSeveridad = filtroSeveridad === 'todas' || 
                          alerta.severidad.toLowerCase() === filtroSeveridad
  const cumpleBusqueda = alerta.mensaje.toLowerCase().includes(busqueda.toLowerCase())
  return cumpleSeveridad && cumpleBusqueda
})

// En el JSX:
<input
  type="text"
  placeholder="🔍 Buscar en alertas..."
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
/>

// ============================================================
// EJEMPLO 9: Exportar datos a CSV
// ============================================================

const exportarACSV = () => {
  const datos = [
    ['Fecha', 'Categoría', 'Monto', 'Tipo'],
    ['2025-10-01', 'Personal', '50000', 'Gasto'],
    ['2025-10-05', 'Ventas', '120000', 'Ingreso'],
    // ... más datos
  ]
  
  const csv = datos.map(fila => fila.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte-${Date.now()}.csv`
  a.click()
}

// Botón:
<button onClick={exportarACSV} className="...">
  📥 Exportar a CSV
</button>

// ============================================================
// EJEMPLO 10: Agregar animaciones al scroll
// ============================================================

/*
Instala:
npm install framer-motion

Uso en componentes:
*/

import { motion } from 'framer-motion'

export function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* tu contenido */}
    </motion.div>
  )
}

// Para lista de items:
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    {/* item */}
  </motion.div>
))}

// ============================================================
// EJEMPLO 11: Agregar selector de empresa
// ============================================================

/*
En App.jsx:
*/

const empresas = [
  { id: 'E001', nombre: 'Tech Innovators' },
  { id: 'E002', nombre: 'Health Solutions' },
  { id: 'E003', nombre: 'Mi Nueva Empresa' }
]

const [empresaSeleccionada, setEmpresaSeleccionada] = useState(empresas[0])

// En el header:
<select 
  value={empresaSeleccionada.id}
  onChange={(e) => {
    const empresa = empresas.find(e => e.id === e.target.value)
    setEmpresaSeleccionada(empresa)
  }}
  className="px-4 py-2 border border-gray-300 rounded-lg"
>
  {empresas.map(emp => (
    <option key={emp.id} value={emp.id}>
      {emp.nombre}
    </option>
  ))}
</select>

// ============================================================
// EJEMPLO 12: Agregar comparador de escenarios
// ============================================================

/*
Permite comparar múltiples simulaciones lado a lado:
*/

const [simulaciones, setSimulaciones] = useState([])

const guardarSimulacion = (resultado) => {
  setSimulaciones([...simulaciones, {
    id: Date.now(),
    fecha: new Date(),
    ...resultado
  }])
}

// Vista de comparación:
<div className="grid grid-cols-3 gap-4">
  {simulaciones.slice(-3).map(sim => (
    <div key={sim.id} className="bg-white p-4 rounded-lg">
      <h4>{sim.descripcion}</h4>
      <p>Riesgo: {sim.nivelRiesgo}</p>
      <p>Reserva: {sim.mesesReserva} meses</p>
    </div>
  ))}
</div>

// ============================================================
// TIPS FINALES
// ============================================================

/*
✅ Mantén los componentes pequeños y enfocados
✅ Usa constantes para valores que se repiten
✅ Comenta tu código para facilitar mantenimiento
✅ Prueba en diferentes tamaños de pantalla
✅ Optimiza imágenes y recursos
✅ Usa React DevTools para depurar
✅ Implementa manejo de errores robusto
✅ Considera accesibilidad (a11y)
✅ Documenta cambios importantes
✅ Mantén dependencias actualizadas

¡Feliz desarrollo! 🚀
*/
