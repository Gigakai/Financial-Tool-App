# 🎨 Guía de Iconos Lucide React

## 📦 Biblioteca Utilizada: Lucide React

**Lucide** es una biblioteca de iconos moderna, elegante y altamente optimizada basada en Feather Icons. Se caracteriza por:

- ✨ **Diseño minimalista y elegante**
- 🎯 **Consistencia visual perfecta**
- ⚡ **Iconos SVG optimizados para performance**
- 🔧 **Completamente personalizables (tamaño, color, stroke)**
- 📦 **Tree-shakeable (solo importas lo que usas)**
- 🎨 **Over 1000+ iconos profesionales**

## 🏗️ Instalación

```bash
npm install lucide-react
```

## 📍 Iconos Utilizados en el Proyecto

### **Navigation & Layout**

| Componente | Icono | Uso |
|-----------|-------|-----|
| `Home` | 🏠 | Dashboard / Inicio |
| `BarChart3` | 📊 | Summary / Resumen financiero |
| `Target` | 🎯 | Simulator / Simulador de escenarios |
| `Activity` | 🏥 | Health Check / Salud financiera |
| `AlertTriangle` | 🚨 | Alerts / Alertas |
| `Menu` | ☰ | Menú hamburguesa |
| `X` | ✕ | Cerrar / Cancelar |

### **Chat & AI**

| Componente | Icono | Uso |
|-----------|-------|-----|
| `Bot` | 🤖 | Chat de IA / Asistente virtual |
| `Send` | ✉️ | Enviar mensaje |
| `Sparkles` | ✨ | Badge IA / Funcionalidad destacada |

### **Financial & Data**

| Componente | Icono | Uso |
|-----------|-------|-----|
| `TrendingUp` | 📈 | Ingresos / Tendencia positiva |
| `TrendingDown` | 📉 | Gastos / Tendencia negativa |
| `BarChart3` | 📊 | Gráficos / Análisis |
| `FileText` | 📄 | Reportes / Documentos |

### **UI Elements**

| Componente | Icono | Uso |
|-----------|-------|-----|
| `Bell` | 🔔 | Notificaciones |
| `ChevronDown` | ▼ | Dropdown / Desplegable |
| `ArrowRight` | → | Navegación / CTA |

## 🎨 Propiedades Personalizables

```jsx
import { Icon } from 'lucide-react'

// Tamaño
<Icon size={24} />          // Número en pixeles
<Icon size="sm" />          // Predefinidos: xs, sm, md, lg, xl

// Color
<Icon className="text-banorte-red" />
<Icon color="#EB0029" />

// Grosor del trazo (stroke)
<Icon strokeWidth={1.5} />  // 1-3 (default: 2)

// Animaciones
<Icon className="animate-pulse" />
<Icon className="hover:scale-110 transition-transform" />
```

## 📝 Ejemplos de Uso en el Proyecto

### **1. Sidebar Navigation**

```jsx
import { Home, BarChart3, Target, Activity, AlertTriangle } from 'lucide-react'

const menuItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/summary', icon: BarChart3, label: 'Summary' },
  { path: '/simulator', icon: Target, label: 'Simulator' },
  { path: '/health', icon: Activity, label: 'Health Check' },
  { path: '/alerts', icon: AlertTriangle, label: 'Alerts' },
]

// Uso
{menuItems.map((item) => {
  const Icon = item.icon
  return <Icon size={20} className="flex-shrink-0" />
})}
```

### **2. Chat Bot Header**

```jsx
import { Bot } from 'lucide-react'

<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
  <Bot size={24} className="text-banorte-red" />
</div>
```

### **3. Bottom Navigation con Animación**

```jsx
import { Bot } from 'lucide-react'

<Bot 
  size={28} 
  strokeWidth={2} 
  className="text-white animate-pulse" 
/>
```

### **4. Cards del Dashboard**

```jsx
import { Activity, AlertTriangle, BarChart3, Target } from 'lucide-react'

// Financial Health Card
<Activity size={24} className="text-positive" />

// Alerts Card
<AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />

// Summary Card
<BarChart3 size={24} className="text-banorte-red" />

// Simulator Card
<Target size={24} className="text-banorte-red" />
```

### **5. Trending Indicators**

```jsx
import { TrendingUp, TrendingDown } from 'lucide-react'

// Ingresos
<div className="flex items-center gap-2">
  <TrendingUp size={16} className="text-positive" />
  <span>Ingresos</span>
</div>

// Gastos
<div className="flex items-center gap-2">
  <TrendingDown size={16} className="text-banorte-red" />
  <span>Gastos</span>
</div>
```

## 🎯 Guía de Estilo

### **Tamaños Recomendados**

```css
/* Navigation icons */
size={20-24}

/* Header icons */
size={18-20}

/* Card headers */
size={24}

/* Inline icons (con texto) */
size={16-18}

/* Chat bot (destacado) */
size={28-32}
```

### **Stroke Width**

```css
/* Default (balanceado) */
strokeWidth={2}

/* Elegante/delgado */
strokeWidth={1.5}

/* Bold/destacado */
strokeWidth={2.5}
```

### **Combinaciones de Color**

```jsx
// Primary (Banorte Red)
className="text-banorte-red"

// Success (Positive)
className="text-positive"

// Warning
className="text-warning"

// Danger/Alert
className="text-alert"

// Neutral
className="text-gray-500"
className="text-gray-600"
```

## 🔍 Iconos Adicionales Disponibles

Si necesitas más iconos, Lucide ofrece:

### **Business & Finance**
- `DollarSign`, `TrendingUp`, `TrendingDown`
- `PieChart`, `BarChart`, `LineChart`
- `CreditCard`, `Wallet`, `Coins`

### **Actions**
- `Plus`, `Minus`, `Edit`, `Trash2`
- `Download`, `Upload`, `Share2`
- `Copy`, `Check`, `CheckCircle`

### **Navigation**
- `ChevronLeft`, `ChevronRight`, `ChevronUp`, `ChevronDown`
- `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`
- `MoreVertical`, `MoreHorizontal`

### **Communication**
- `MessageSquare`, `MessageCircle`, `Mail`
- `Phone`, `Video`, `Mic`

### **Files & Documents**
- `File`, `FileText`, `FilePlus`
- `Folder`, `FolderOpen`, `Download`

## 📚 Recursos

- **Documentación oficial**: https://lucide.dev/
- **Explorador de iconos**: https://lucide.dev/icons/
- **GitHub**: https://github.com/lucide-icons/lucide

## 🎨 Ventajas sobre Emojis

| Aspecto | Emojis | Lucide Icons |
|---------|--------|--------------|
| Consistencia | ❌ Varía por SO/browser | ✅ Siempre igual |
| Personalización | ❌ Limitada | ✅ Total (color, tamaño, stroke) |
| Performance | ⚠️ Puede variar | ✅ Optimizado SVG |
| Profesionalismo | ⚠️ Informal | ✅ Corporativo/elegante |
| Accesibilidad | ⚠️ Limitada | ✅ Excelente (aria-labels) |
| Tamaño | ❌ No escalable | ✅ Vector infinito |

## ✨ Tips de Uso

1. **Mantén consistencia en tamaños**: Usa la misma escala de tamaños en toda la app
2. **Stroke width uniforme**: Usa strokeWidth={1.5} para elegancia
3. **Colores semánticos**: Rojo para alertas, verde para positivo, etc.
4. **Animaciones sutiles**: Solo en elementos interactivos
5. **Flex-shrink-0**: Evita que se compriman en flex containers
6. **Padding en botones**: Deja espacio alrededor del icono

```jsx
// ✅ Bueno
<Icon size={20} strokeWidth={1.5} className="flex-shrink-0" />

// ❌ Evitar
<Icon size={20} strokeWidth={3} /> // Muy grueso
<Icon size={50} /> // Muy grande sin razón
```
