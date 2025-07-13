# 📱 Generación de APK - Cuentas Claras

## Método 1: Usando EAS Build (Recomendado)

### Pasos para generar APK:

1. **Instalar EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Configurar EAS**:
   ```bash
   eas build:configure
   ```

3. **Generar APK**:
   ```bash
   eas build --platform android --profile preview
   ```

## Método 2: Usando Android Studio

1. **Exportar proyecto**:
   ```bash
   npx expo run:android
   ```

2. **Generar APK desde Android Studio**:
   - Build → Build Bundle(s) / APK(s) → Build APK(s)

## Método 3: Usando Expo Application Services

1. **Crear cuenta en Expo** (opcional para builds locales)
2. **Configurar eas.json** (ya incluido en el proyecto)
3. **Ejecutar build**:
   ```bash
   eas build --platform android --local
   ```

## Archivos incluidos:

- ✅ `eas.json` - Configuración de build
- ✅ `app.json` - Configuración de la aplicación con package name
- ✅ Proyecto exportado en `/dist` para build manual

## APK generada:

- **Nombre**: CuentasClaras.apk
- **Package**: com.adrian04981.cuentasclaras
- **Versión**: 1.0.0
- **Tamaño estimado**: ~8-10 MB
- **Android mínimo**: 5.0 (API 21)

## Para subir al repositorio:

1. Generar APK usando cualquiera de los métodos anteriores
2. Crear release en GitHub
3. Subir APK como asset del release
4. El README ya incluye el botón de descarga
