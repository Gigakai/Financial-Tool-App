// Constantes de la aplicación

// Configuración de API
export const API_CONFIG = {
  DEFAULT_EMPRESA_ID: import.meta.env.VITE_DEFAULT_EMPRESA_ID || 'E001',
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
}

export const COLORS = {
  banorte: {
    red: '#EB0029',
    gray: '#58616D',
    white: '#FFFFFF',
  },
  positive: '#6CCC4A',
  alert: '#FF671B',
  warning: '#FFA400',
  link: '#EB0029',
}

export const RISK_LEVELS = {
  LOW: 'Bajo',
  MODERATE: 'Moderado',
  HIGH: 'Alto',
  CRITICAL: 'Crítico',
}

export const ALERT_TYPES = {
  BUDGET_EXCEEDED: 'BUDGET_EXCEEDED',
  PACING_WARNING: 'PACING_WARNING',
  CASHFLOW_WARNING: 'CASHFLOW_WARNING',
}

export const TIME_PERIODS = {
  CURRENT_MONTH: 'current_month',
  LAST_30_DAYS: 'last_30_days',
  LAST_90_DAYS: 'last_90_days',
}

export const TRANSACTION_TYPES = {
  INCOME: 'ingreso',
  EXPENSE: 'gasto',
}

export const CATEGORIES = [
  'Marketing',
  'Personal',
  'Operaciones',
  'Tecnología',
  'Administrativo',
  'Ventas',
]
