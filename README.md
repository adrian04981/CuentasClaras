# 💰 Cuentas Claras

<div align="center">

![Cuentas Claras Logo](https://via.placeholder.com/150x150/007AFF/FFFFFF?text=CC)

**Aplicación de gestión financiera personal desarrollada con React Native**

[![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://javascript.info/)
[![Open Source](https://img.shields.io/badge/Open%20Source-💚-green?style=for-the-badge)](https://opensource.org/)

---

### 📱 Descarga la APK

[![Descargar APK](https://img.shields.io/badge/📱_Descargar_APK-4CAF50?style=for-the-badge&logoColor=white)](https://github.com/adrian04981/CuentasClaras/releases/latest/download/CuentasClaras.apk)

*Version 1.0.0 - Compatible con Android 5.0+*

---

</div>

## 🌟 Características Principales

### 📊 **Gestión Financiera Completa**
- ✅ Registro de ingresos y gastos
- ✅ Categorías personalizables (Alimentación, Transporte, Salud, etc.)
- ✅ Historial detallado por mes
- ✅ Análisis visual con gráficos interactivos

### 🎯 **Dos Modos de Uso**
- **🔰 Modo Básico**: Perfecto para usuarios principiantes
  - Solo ingresos y gastos
  - Interfaz simplificada
  
- **💼 Modo Semi-Profesional**: Para usuarios avanzados
  - Gestión de múltiples cuentas bancarias
  - Transferencias entre cuentas
  - Reportes detallados

### � **Soporte Multi-Moneda**
- 16+ monedas soportadas (EUR, USD, GBP, JPY, MXN, ARS, etc.)
- Formateo automático según la moneda seleccionada
- Símbolos y banderas de países

### 📱 **Multiplataforma**
- **🌐 Web**: Funciona en cualquier navegador moderno
- **📱 Android**: APK nativa optimizada
- **🔄 Responsive**: Se adapta a cualquier tamaño de pantalla

### 🔒 **Privacidad y Seguridad**
- **📴 100% Offline**: Sin conexión a internet requerida
- **🏠 Datos Locales**: Todo se guarda en tu dispositivo
- **🔐 Sin Registro**: No necesitas crear cuentas
- **🚫 Sin Publicidad**: Completamente libre de ads

### 💾 **Sistema de Backup Avanzado**
- **🗜️ Compresión**: Archivos hasta 70% más pequeños
- **📁 Formato .ccbackup**: Archivos optimizados con metadata
- **⬇️ Descarga Automática**: Un clic para crear backup
- **⬆️ Importación Fácil**: Restaura desde archivo
- **🔄 Compatibilidad**: Funciona con backups antiguos
- **Almacenamiento local**: Todos los datos se guardan en tu dispositivo

## 🛠️ Tecnologías

- **React Native** con Expo
- **React Navigation** para navegación entre pantallas
- **Local Storage** para persistencia de datos
- **React Native Chart Kit** para gráficos (móvil)
- **Gráficos optimizados** para web
- **Vector Icons** para iconografía

## 🎯 Optimizaciones

### Para Web
- Bundle optimizado < 1MB
- Gráficos ligeros sin dependencias pesadas
- Tree shaking automático
- Componentes condicionales según plataforma

### Para Móvil
- Gráficos completos con animaciones
- Navegación nativa
- Rendimiento optimizado

## 📱 Pantallas

### 1. Inicio
- Formulario de nueva transacción
- Selector de mes/año
- Resumen financiero del período
- Lista de transacciones del mes seleccionado

### 2. Análisis
- Filtros avanzados por período, categoría y monto
- Selector de tipo de gráfico
- Gráficos de categorías, barras y tendencias
- Resumen financiero filtrado

### 3. Configuración
- Información de almacenamiento
- Exportación e importación de datos
- Eliminación completa de datos
- Información de la aplicación

## 🚀 Instalación y Uso

### Requisitos
- Node.js 16 o superior
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone [tu-repositorio]

# Instalar dependencias
npm install

# Ejecutar en web
npm run web

# Ejecutar en móvil
npm run android  # Android
npm run ios      # iOS
```

### Build para Web
```bash
npm run build:web
```

## 📦 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── TransactionForm.js    # Formulario de transacciones
│   ├── TransactionList.js    # Lista de transacciones
│   ├── FinancialSummary.js   # Resumen financiero
│   ├── MonthSelector.js      # Selector de mes/año
│   ├── ChartComponent.js     # Gráficos completos (móvil)
│   └── OptimizedChart.js     # Gráficos optimizados (web)
├── screens/             # Pantallas principales
│   ├── HomeScreen.js         # Pantalla de inicio
│   ├── AnalysisScreen.js     # Pantalla de análisis
│   └── SettingsScreen.js     # Pantalla de configuración
├── navigation/          # Configuración de navegación
│   └── AppNavigator.js       # Navegador principal
├── hooks/              # Hooks personalizados
│   └── useTransactions.js    # Hook para manejo de transacciones
└── utils/              # Utilidades
    └── storage.js            # Gestor de almacenamiento local
```

## 💾 Gestión de Datos

### Almacenamiento
- Los datos se guardan en `localStorage` del navegador (web) o AsyncStorage (móvil)
- Compresión automática para optimizar espacio
- Verificación de integridad en cada operación

### Formato de Backup
```json
{
  "transactions": [...],
  "settings": {...},
  "exportDate": "2025-01-13T...",
  "version": "1.0"
}
```

## 🎨 Diseño

### Principios de Diseño
- **Minimalista**: Interfaz limpia y fácil de usar
- **Responsive**: Funciona en dispositivos móviles y escritorio
- **Consistente**: Sistema de colores y tipografía uniforme
- **Accesible**: Contrastes adecuados y navegación clara

### Colores
- Primario: #007AFF (Azul iOS)
- Éxito: #34C759 (Verde)
- Error: #FF3B30 (Rojo)
- Advertencia: #FF9500 (Naranja)

## 🔒 Privacidad

- **100% Local**: Todos los datos se almacenan únicamente en tu dispositivo
- **Sin servidores**: No se envía información a servidores externos
- **Control total**: Tú decides cuándo exportar, importar o eliminar datos

## 📋 Funcionalidades Futuras

- [ ] Modo oscuro
- [ ] Múltiples monedas
- [ ] Categorías personalizadas
- [ ] Presupuestos y metas
- [ ] Recordatorios
- [ ] Sincronización en la nube (opcional)

## 🤝 Contribuciones

Este es un proyecto open source. Las contribuciones son bienvenidas:

1. Fork del proyecto
2. Crea una rama para tu feature
3. Commit de tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License - Ve el archivo LICENSE para más detalles.

## 🐛 Reportar Problemas

Si encuentras algún problema o tienes sugerencias, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ para ayudarte a mantener tus cuentas claras**
