/**
 * Constantes y configuraciones globales para la aplicación
 */

// Configuración de empresas de ejemplo
export const EMPRESAS_DEMO = {
  E001: {
    id: 'E001',
    nombre: 'Tech Innovators',
    descripcion: 'Empresa líder en soluciones tecnológicas',
    efectivo: 250000000,
    industria: 'Tecnología',
    riesgo: 'Medium'
  },
  E002: {
    id: 'E002',
    nombre: 'Health Solutions',
    descripcion: 'Soluciones innovadoras en salud',
    efectivo: 1200000,
    industria: 'Salud',
    riesgo: 'Low'
  }
}

// Categorías de gastos con sus iconos
export const CATEGORIAS_GASTOS = {
  personal: { nombre: 'Personal', icono: '👥', color: 'blue' },
  marketing: { nombre: 'Marketing', icono: '📢', color: 'purple' },
  operaciones: { nombre: 'Operaciones', icono: '⚙️', color: 'green' },
  tecnologia: { nombre: 'Tecnología', icono: '💻', color: 'indigo' },
  infraestructura: { nombre: 'Infraestructura', icono: '🏢', color: 'gray' },
  otros: { nombre: 'Otros', icono: '📦', color: 'yellow' }
}

// Niveles de riesgo
export const NIVELES_RIESGO = {
  bajo: {
    nombre: 'Bajo',
    color: 'green',
    emoji: '✅',
    descripcion: 'Tu negocio está muy seguro'
  },
  moderado: {
    nombre: 'Moderado',
    color: 'blue',
    emoji: '👍',
    descripcion: 'Tu negocio está estable'
  },
  alto: {
    nombre: 'Alto',
    color: 'yellow',
    emoji: '⚠️',
    descripcion: 'Requiere atención y cuidado'
  },
  critico: {
    nombre: 'Crítico',
    color: 'red',
    emoji: '🚨',
    descripcion: 'Situación que necesita acción inmediata'
  }
}

// Perfiles de riesgo de empresa
export const PERFILES_RIESGO = {
  low: {
    nombre: 'Conservador',
    mesesReservaRecomendados: 12,
    descripcion: 'Prefieres jugar seguro y mantener una reserva amplia'
  },
  medium: {
    nombre: 'Balanceado',
    mesesReservaRecomendados: 6,
    descripcion: 'Equilibras seguridad con oportunidades de crecimiento'
  },
  high: {
    nombre: 'Agresivo',
    mesesReservaRecomendados: 3,
    descripcion: 'Priorizas el crecimiento rápido sobre la seguridad'
  }
}

// Escenarios predefinidos para el simulador
export const ESCENARIOS_PREDEFINIDOS = [
  {
    id: 1,
    titulo: '👨‍💼 Contratar un Empleado',
    descripcion: 'Contratar un nuevo empleado de tiempo completo',
    costoRecurrente: 50000,
    costoUnico: 15000,
    emoji: '👨‍💼',
    explicacion: 'Incluye salario mensual y costo de contratación/capacitación',
    categoria: 'personal'
  },
  {
    id: 2,
    titulo: '📢 Campaña de Marketing',
    descripcion: 'Lanzar una campaña de marketing digital',
    costoRecurrente: 20000,
    costoUnico: 50000,
    emoji: '📢',
    explicacion: 'Inversión inicial en campaña y mantenimiento mensual',
    categoria: 'marketing'
  },
  {
    id: 3,
    titulo: '🖥️ Comprar Equipo',
    descripcion: 'Adquirir nuevo equipo tecnológico',
    costoRecurrente: 2000,
    costoUnico: 100000,
    emoji: '🖥️',
    explicacion: 'Costo de compra y mantenimiento mensual',
    categoria: 'tecnologia'
  },
  {
    id: 4,
    titulo: '🏢 Expandir Oficina',
    descripcion: 'Rentar una oficina más grande',
    costoRecurrente: 35000,
    costoUnico: 70000,
    emoji: '🏢',
    explicacion: 'Depósito inicial y renta mensual aumentada',
    categoria: 'infraestructura'
  },
  {
    id: 5,
    titulo: '🚀 Lanzar Producto',
    descripcion: 'Desarrollo y lanzamiento de un nuevo producto',
    costoRecurrente: 30000,
    costoUnico: 150000,
    emoji: '🚀',
    explicacion: 'Inversión inicial en desarrollo y costos de mantenimiento',
    categoria: 'tecnologia'
  },
  {
    id: 6,
    titulo: '📚 Capacitación',
    descripcion: 'Programa de capacitación para el equipo',
    costoRecurrente: 5000,
    costoUnico: 25000,
    emoji: '📚',
    explicacion: 'Inversión en cursos y materiales de capacitación',
    categoria: 'personal'
  }
]

// Tipos de alertas
export const TIPOS_ALERTAS = {
  BUDGET_EXCEEDED: {
    nombre: 'Presupuesto Excedido',
    emoji: '⚠️',
    severidadPredeterminada: 'Alto'
  },
  PACING_WARNING: {
    nombre: 'Ritmo de Gasto Alto',
    emoji: '📊',
    severidadPredeterminada: 'Medio'
  },
  CASHFLOW_WARNING: {
    nombre: 'Alerta de Flujo de Caja',
    emoji: '💰',
    severidadPredeterminada: 'Crítico'
  },
  LOW_RUNWAY: {
    nombre: 'Reserva Baja',
    emoji: '⏰',
    severidadPredeterminada: 'Alto'
  }
}

// Colores del tema
export const COLORES_TEMA = {
  primario: '#6366f1', // Indigo
  secundario: '#8b5cf6', // Purple
  exito: '#10b981', // Green
  advertencia: '#f59e0b', // Yellow
  peligro: '#ef4444', // Red
  info: '#3b82f6' // Blue
}

// Configuración de formato
export const FORMATO = {
  moneda: {
    simbolo: '$',
    decimales: 2,
    separadorMiles: ',',
    separadorDecimal: '.'
  },
  fecha: {
    formato: 'DD/MM/YYYY',
    locale: 'es-MX'
  }
}

// Mensajes de ayuda
export const MENSAJES_AYUDA = {
  dashboard: {
    reservaEfectivo: 'Indica cuántos meses puedes operar sin ingresos con tu efectivo actual',
    presupuestos: 'Compara tus gastos actuales contra los presupuestos establecidos',
    balance: 'Diferencia entre tus ingresos y gastos del mes'
  },
  simulador: {
    costoUnico: 'Gastos que ocurren una sola vez (compras, depósitos, inversiones iniciales)',
    costoRecurrente: 'Gastos que se repetirán cada mes (salarios, rentas, suscripciones)',
    nivelRiesgo: 'Evaluación del impacto de esta decisión en la salud financiera de tu negocio'
  },
  alertas: {
    critico: 'Requiere acción inmediata para evitar problemas graves',
    alto: 'Necesita tu atención pronto',
    medio: 'Monitorea de cerca esta situación',
    bajo: 'Informativo, no requiere acción urgente'
  }
}

// Configuración de la aplicación
export const CONFIG_APP = {
  nombreApp: 'Mi Asistente Financiero',
  version: '1.0.0',
  empresaPredeterminada: 'E001',
  actualizacionAutomatica: true,
  intervaloActualizacion: 300000, // 5 minutos en milisegundos
  mostrarTutorial: true
}

// Umbrales y límites
export const UMBRALES = {
  presupuesto: {
    critico: 100, // % del presupuesto usado
    advertencia: 80,
    precaucion: 70
  },
  reserva: {
    ideal: 12, // meses
    bueno: 6,
    minimo: 3
  },
  ritmoGasto: {
    normal: 1.0, // ratio de gasto vs tiempo transcurrido
    alto: 1.2,
    critico: 1.5
  }
}

// Textos de la interfaz (para facilitar traducción futura)
export const TEXTOS = {
  navegacion: {
    dashboard: 'Mi Negocio',
    simulador: 'Simular Decisión',
    alertas: 'Alertas'
  },
  botones: {
    simular: 'Simular Impacto',
    limpiar: 'Limpiar',
    ver_detalles: 'Ver detalles',
    marcar_leida: 'Marcar como leída'
  },
  estados: {
    cargando: 'Cargando...',
    sin_datos: 'No hay datos disponibles',
    error: 'Ocurrió un error'
  }
}

// Funciones de utilidad
export const formatearMoneda = (cantidad) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cantidad)
}

export const formatearNumero = (numero) => {
  return new Intl.NumberFormat('es-MX').format(numero)
}

export const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const calcularPorcentaje = (valor, total) => {
  if (total === 0) return 0
  return Math.round((valor / total) * 100)
}

export const obtenerColorPorPorcentaje = (porcentaje) => {
  if (porcentaje >= 90) return 'red'
  if (porcentaje >= 70) return 'yellow'
  return 'green'
}

export const obtenerColorPorNivelRiesgo = (nivel) => {
  const niveles = {
    'Bajo': 'green',
    'Moderado': 'blue',
    'Alto': 'yellow',
    'Crítico': 'red'
  }
  return niveles[nivel] || 'gray'
}
