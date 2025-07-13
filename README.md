# Cuentas Claras 💰

Una aplicación moderna de gestión financiera personal desarrollada con React Native, optimizada para web y móvil.

## 🚀 Características

### 📊 Gestión de Transacciones
- **Registro rápido**: Añade ingresos y gastos con categorías predefinidas
- **Edición intuitiva**: Modifica o elimina transacciones existentes
- **Navegación temporal**: Navega por meses para ver el historial

### 📈 Análisis Financiero
- **Gráficos interactivos**: Visualiza tus datos con gráficos de pastel, barras y tendencias
- **Filtros avanzados**: Filtra por fecha, categoría, tipo y rango de montos
- **Resúmenes automáticos**: Ve balances, totales y estadísticas al instante

### ⚙️ Configuración y Backup
- **Exportar datos**: Descarga un backup completo en formato JSON
- **Importar datos**: Restaura desde un archivo de backup
- **Gestión de datos**: Elimina todos los datos cuando necesites empezar de cero
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
