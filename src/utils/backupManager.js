import LZString from 'lz-string';
import { Platform, Alert } from 'react-native';

class BackupManager {
  // Comprimir datos para backup
  compressData(data) {
    try {
      // Limpiar y optimizar datos antes de comprimir
      const cleanData = this.cleanData(data);
      const jsonString = JSON.stringify(cleanData);
      
      // Comprimir con LZ-String
      const compressed = LZString.compressToBase64(jsonString);
      
      return {
        data: compressed,
        originalSize: jsonString.length,
        compressedSize: compressed.length,
        compressionRatio: ((1 - compressed.length / jsonString.length) * 100).toFixed(1)
      };
    } catch (error) {
      console.error('Error compressing data:', error);
      throw new Error('Error al comprimir los datos');
    }
  }

  // Descomprimir datos de backup
  decompressData(compressedData) {
    try {
      const decompressed = LZString.decompressFromBase64(compressedData);
      if (!decompressed) {
        throw new Error('Datos de backup inválidos o corruptos');
      }
      
      const data = JSON.parse(decompressed);
      return this.validateBackupData(data);
    } catch (error) {
      console.error('Error decompressing data:', error);
      throw new Error('Error al descomprimir los datos del backup');
    }
  }

  // Limpiar datos innecesarios para reducir tamaño
  cleanData(data) {
    const cleaned = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      transactions: data.transactions?.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        category: t.category,
        account: t.account,
        date: t.date,
        // Remover campos innecesarios como createdAt si es igual a date
        ...(t.createdAt && t.createdAt !== t.date && { createdAt: t.createdAt })
      })) || [],
      settings: data.settings || {},
      categories: data.categories || {},
      accounts: data.accounts || {}
    };

    // Remover campos vacíos
    Object.keys(cleaned).forEach(key => {
      if (Array.isArray(cleaned[key]) && cleaned[key].length === 0) {
        delete cleaned[key];
      } else if (typeof cleaned[key] === 'object' && Object.keys(cleaned[key]).length === 0) {
        delete cleaned[key];
      }
    });

    return cleaned;
  }

  // Validar datos de backup
  validateBackupData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Formato de backup inválido');
    }

    // Validar que tenga al menos transacciones o configuraciones
    if (!data.transactions && !data.settings) {
      throw new Error('El backup no contiene datos válidos');
    }

    // Validar estructura de transacciones
    if (data.transactions) {
      if (!Array.isArray(data.transactions)) {
        throw new Error('Las transacciones deben ser un array');
      }

      // Validar cada transacción
      data.transactions.forEach((transaction, index) => {
        if (!transaction.id || !transaction.type || transaction.amount === undefined) {
          throw new Error(`Transacción ${index + 1} tiene datos incompletos`);
        }
      });
    }

    return data;
  }

  // Crear archivo de backup y descargarlo
  async downloadBackup(data, filename) {
    try {
      const { data: compressedData, compressionRatio } = this.compressData(data);
      
      // Crear objeto de backup con metadata
      const backupFile = {
        metadata: {
          appName: 'CuentasClaras',
          version: '2.0',
          exportDate: new Date().toISOString(),
          compressionRatio: compressionRatio + '%'
        },
        data: compressedData
      };

      const backupString = JSON.stringify(backupFile);

      if (Platform.OS === 'web') {
        // Descargar en web
        const blob = new Blob([backupString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `cuentas-claras-${new Date().toISOString().split('T')[0]}.ccbackup`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return {
          success: true,
          message: `Backup descargado (${compressionRatio}% compresión)`,
          compressionRatio
        };
      } else {
        // Para móvil, usar share
        const { Share } = require('react-native');
        await Share.share({
          message: backupString,
          title: 'Backup CuentasClaras',
        });

        return {
          success: true,
          message: `Backup compartido (${compressionRatio}% compresión)`,
          compressionRatio
        };
      }
    } catch (error) {
      console.error('Error downloading backup:', error);
      throw error;
    }
  }

  // Cargar backup desde archivo
  loadBackupFromFile() {
    if (Platform.OS === 'web') {
      return new Promise((resolve, reject) => {
        // Crear input file invisible
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.ccbackup,.json';
        input.style.display = 'none';

        input.onchange = (event) => {
          const file = event.target.files[0];
          if (!file) {
            reject(new Error('No se seleccionó ningún archivo'));
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const content = e.target.result;
              const backupData = this.parseBackupFile(content);
              resolve(backupData);
            } catch (error) {
              reject(error);
            }
          };

          reader.onerror = () => {
            reject(new Error('Error al leer el archivo'));
          };

          reader.readAsText(file);
          document.body.removeChild(input);
        };

        input.oncancel = () => {
          document.body.removeChild(input);
          reject(new Error('Carga cancelada'));
        };

        document.body.appendChild(input);
        input.click();
      });
    } else {
      // Para móvil, necesitaríamos usar react-native-document-picker
      throw new Error('Carga de archivos no implementada para móvil');
    }
  }

  // Parsear archivo de backup
  parseBackupFile(content) {
    try {
      let backupData;
      
      try {
        // Intentar parsear como nuevo formato (.ccbackup)
        const backupFile = JSON.parse(content);
        
        if (backupFile.metadata && backupFile.data) {
          // Nuevo formato comprimido
          backupData = this.decompressData(backupFile.data);
        } else if (backupFile.transactions || backupFile.settings) {
          // Formato anterior sin comprimir
          backupData = backupFile;
        } else {
          throw new Error('Formato no reconocido');
        }
      } catch (parseError) {
        // Si falla el parseo, intentar como texto plano comprimido
        backupData = this.decompressData(content);
      }

      return this.validateBackupData(backupData);
    } catch (error) {
      console.error('Error parsing backup file:', error);
      throw new Error('Archivo de backup inválido o corrupto');
    }
  }

  // Obtener información del backup sin cargarlo
  getBackupInfo(content) {
    try {
      const backupFile = JSON.parse(content);
      
      if (backupFile.metadata) {
        return {
          version: backupFile.metadata.version,
          exportDate: backupFile.metadata.exportDate,
          compressionRatio: backupFile.metadata.compressionRatio,
          isCompressed: true
        };
      }
      
      // Backup sin comprimir
      return {
        version: backupFile.version || '1.0',
        exportDate: backupFile.exportDate,
        isCompressed: false,
        transactionCount: backupFile.transactions?.length || 0
      };
    } catch (error) {
      return null;
    }
  }
}

export default new BackupManager();
