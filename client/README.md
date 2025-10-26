# CFO Virtual - Client

Frontend para el sistema CFO Virtual desarrollado con React, NextUI y Tailwind CSS.

**Servidor corriendo en:** http://localhost:3000/

## **Diseño Mobile-First**
- Optimizado para dispositivos móviles primero
- Bottom navigation en móvil
- Chat de IA como elemento principal
- Diseño responsivo que se adapta a todas las pantallas

## 🎨 Colores Banorte

- **Rojo Banorte**: `#EB0029`
- **Gris Banorte**: `#58616D`
- **Blanco**: `#FFFFFF`
- **Positivo (Verde)**: `#6CCC4A`
- **Alerta (Naranja)**: `#FF671B`
- **Aviso (Amarillo)**: `#FFA400`

## 📁 Estructura del Proyecto

```
src/
├── components/
│   └── layout/          # Componentes de layout (Sidebar, Header)
├── layouts/             # Layout principal
├── pages/               # Páginas de la aplicación
│   ├── Dashboard.jsx    # Vista principal unificada
│   ├── Summary.jsx      # Reportes financieros
│   ├── Simulator.jsx    # Simulador de escenarios
│   ├── HealthCheck.jsx  # Análisis de salud
│   └── Alerts.jsx       # Centro de alertas
├── services/            # Servicios de API
└── utils/               # Utilidades y constantes
```

## 🚀 Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

## 🛠️ Tecnologías

- **React 18** - Framework principal
- **NextUI** - Librería de componentes UI
- **Tailwind CSS** - Estilos
- **React Router DOM** - Navegación
- **Vite** - Build tool
- **Framer Motion** - Animaciones

## 📦 Componentes Principales

- **Dashboard**: Vista unificada con 4 cards principales
- **Sidebar**: Navegación lateral con iconos
- **Header**: Barra superior con selector de empresa
- **Layout**: Estructura base con sidebar y header

## 🎯 Características

- Diseño responsive
- Colores corporativos Banorte
- Navegación intuitiva
- Cards interactivos con hover effects
- Sistema de alertas visual
- Integración con API backend
