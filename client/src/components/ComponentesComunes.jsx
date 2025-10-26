// Componentes reutilizables para la interfaz

/**
 * Tarjeta de Métrica - Muestra un valor numérico con descripción
 */
export function MetricCard({ titulo, valor, icono, color = 'blue', descripcion }) {
  const colores = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  }

  return (
    <div className={`${colores[color]} rounded-lg p-4 transition-all hover:shadow-md`}>
      {icono && <span className="text-2xl mb-2 block">{icono}</span>}
      <p className="text-sm text-gray-600 mb-1">{titulo}</p>
      <p className={`text-2xl font-bold ${color === 'blue' ? 'text-blue-600' : 
        color === 'green' ? 'text-green-600' : 
        color === 'red' ? 'text-red-600' : 
        color === 'yellow' ? 'text-yellow-600' : 
        color === 'purple' ? 'text-purple-600' : 'text-indigo-600'}`}>
        {valor}
      </p>
      {descripcion && <p className="text-xs text-gray-500 mt-1">{descripcion}</p>}
    </div>
  )
}

/**
 * Barra de Progreso - Muestra progreso visual con porcentaje
 */
export function ProgressBar({ porcentaje, color = 'blue', altura = 'h-3', mostrarPorcentaje = true }) {
  const colores = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    indigo: 'bg-indigo-500'
  }

  const colorBarra = porcentaje >= 90 ? colores.red :
                     porcentaje >= 70 ? colores.yellow :
                     colores.green

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full ${altura}`}>
        <div
          className={`${colorBarra} ${altura} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(porcentaje, 100)}%` }}
        ></div>
      </div>
      {mostrarPorcentaje && (
        <p className="text-xs text-gray-500 text-right mt-1">{porcentaje}%</p>
      )}
    </div>
  )
}

/**
 * Badge - Etiqueta de estado
 */
export function Badge({ texto, color = 'blue', tamaño = 'sm' }) {
  const colores = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-700'
  }

  const tamaños = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-xs px-3 py-1',
    md: 'text-sm px-4 py-1.5',
    lg: 'text-base px-5 py-2'
  }

  return (
    <span className={`${colores[color]} ${tamaños[tamaño]} rounded-full font-semibold inline-block`}>
      {texto}
    </span>
  )
}

/**
 * Botón de Acción
 */
export function ActionButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  tamaño = 'md', 
  disabled = false,
  icono 
}) {
  const variantes = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
  }

  const tamaños = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantes[variant]} 
        ${tamaños[tamaño]} 
        rounded-lg font-semibold 
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:shadow-md active:scale-95
        flex items-center justify-center space-x-2
      `}
    >
      {icono && <span className="text-lg">{icono}</span>}
      <span>{children}</span>
    </button>
  )
}

/**
 * Tarjeta de Información
 */
export function InfoCard({ titulo, descripcion, icono, children, color = 'indigo' }) {
  const coloresBorde = {
    indigo: 'border-indigo-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    purple: 'border-purple-600'
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${coloresBorde[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{titulo}</h3>
        {icono && <span className="text-3xl">{icono}</span>}
      </div>
      {descripcion && <p className="text-gray-600 mb-4">{descripcion}</p>}
      {children}
    </div>
  )
}

/**
 * Alerta/Notificación
 */
export function Alert({ tipo = 'info', titulo, mensaje, icono, onClose }) {
  const tipos = {
    info: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-900', emoji: 'ℹ️' },
    success: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-900', emoji: '✅' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-900', emoji: '⚠️' },
    error: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-900', emoji: '🚨' }
  }

  const estilo = tipos[tipo]

  return (
    <div className={`${estilo.bg} border-l-4 ${estilo.border} p-4 rounded-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">{icono || estilo.emoji}</span>
          <div>
            {titulo && <h4 className={`font-semibold ${estilo.text} mb-1`}>{titulo}</h4>}
            <p className={`${estilo.text} text-sm`}>{mensaje}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 ml-4"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Tooltip simple
 */
export function Tooltip({ children, texto }) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="invisible group-hover:visible absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg whitespace-nowrap">
        {texto}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  )
}

/**
 * Skeleton Loader - Para estados de carga
 */
export function Skeleton({ altura = 'h-4', ancho = 'w-full', redondo = false }) {
  return (
    <div className={`${altura} ${ancho} ${redondo ? 'rounded-full' : 'rounded'} bg-gray-200 animate-pulse`}></div>
  )
}

/**
 * Card Container - Contenedor genérico para tarjetas
 */
export function Card({ children, hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-lg p-6 
        ${hover ? 'hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1' : ''}
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {children}
    </div>
  )
}

/**
 * Divider - Separador visual
 */
export function Divider({ texto }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      {texto && (
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-sm text-gray-500">{texto}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Empty State - Para cuando no hay datos
 */
export function EmptyState({ icono = '📭', titulo, descripcion, accion }) {
  return (
    <div className="text-center py-12">
      <span className="text-6xl block mb-4">{icono}</span>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{titulo}</h3>
      {descripcion && <p className="text-gray-600 mb-6">{descripcion}</p>}
      {accion}
    </div>
  )
}

/**
 * Loading Spinner
 */
export function LoadingSpinner({ tamaño = 'md', mensaje }) {
  const tamaños = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`${tamaños[tamaño]} border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}></div>
      {mensaje && <p className="text-gray-600 mt-4">{mensaje}</p>}
    </div>
  )
}
