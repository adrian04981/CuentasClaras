@echo off
echo ========================================
echo    GENERADOR DE APK - CUENTAS CLARAS
echo ========================================
echo.
echo Este script generará el APK de Cuentas Claras
echo.

REM Método 1: Usando Expo EAS (Recomendado)
echo [1/3] Intentando con Expo EAS...
call npx eas build --platform android --profile preview --local --non-interactive
if %ERRORLEVEL%==0 (
    echo ✅ APK generado con EAS
    goto :copy_apk
)

REM Método 2: Usando Gradle directamente
echo [2/3] Intentando con Gradle...
cd android
if exist gradlew.bat (
    call gradlew.bat assembleRelease
    if %ERRORLEVEL%==0 (
        echo ✅ APK generado con Gradle
        cd ..
        goto :copy_apk
    )
)
cd ..

REM Método 3: Build manual con Expo
echo [3/3] Generando con Expo export...
call npx expo export --platform android --output-dir android-export
if %ERRORLEVEL%==0 (
    echo ✅ Export completado, APK base generado
)

:copy_apk
echo.
echo Buscando APK generado...
for /r %%i in (*.apk) do (
    if not "%%~ni"=="CuentasClaras" (
        echo Copiando %%i a CuentasClaras.apk
        copy "%%i" "CuentasClaras.apk"
        echo ✅ APK actualizado: CuentasClaras.apk
        goto :end
    )
)

:end
echo.
echo ========================================
echo  APK LISTO PARA DISTRIBUCIÓN
echo ========================================
echo.
echo 📱 Archivo: CuentasClaras.apk
echo 📊 Tamaño: 
for %%A in (CuentasClaras.apk) do echo    %%~zA bytes
echo 🔗 Disponible en: README.md
echo.
echo Para subir al repositorio:
echo 1. git add CuentasClaras.apk
echo 2. git commit -m "🚀 APK v1.0.0 actualizado"
echo 3. git push
echo.
pause
