import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomModal from './CustomModal';

const BackupModal = ({ 
  visible, 
  onClose, 
  onExport, 
  onImport, 
  storageInfo 
}) => {
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      await onExport();
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setImportLoading(true);
    try {
      await onImport();
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setImportLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Gestión de Backup"
      size="large"
    >
      <View style={styles.container}>
        {/* Información actual */}
        {storageInfo && (
          <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text style={styles.infoTitle}>Datos actuales</Text>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{storageInfo.transactionCount}</Text>
                <Text style={styles.statLabel}>Transacciones</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{storageInfo.categoryCount}</Text>
                <Text style={styles.statLabel}>Categorías</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{storageInfo.accountCount}</Text>
                <Text style={styles.statLabel}>Cuentas</Text>
              </View>
            </View>

            <View style={styles.sizeInfo}>
              <Text style={styles.sizeText}>
                Tamaño total: {formatSize(storageInfo.totalSize)}
              </Text>
            </View>
          </View>
        )}

        {/* Exportar backup */}
        <View style={styles.section}>
          <View style={styles.actionHeader}>
            <Ionicons name="download-outline" size={24} color="#28a745" />
            <Text style={styles.actionTitle}>Exportar Backup</Text>
          </View>
          
          <Text style={styles.actionDescription}>
            Descarga un archivo comprimido con todas tus transacciones y configuraciones.
          </Text>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.featureText}>Compresión avanzada (hasta 70% menos espacio)</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.featureText}>Archivo .ccbackup optimizado</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.featureText}>Descarga automática</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton]}
            onPress={handleExport}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="download" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Descargar Backup</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Importar backup */}
        <View style={styles.section}>
          <View style={styles.actionHeader}>
            <Ionicons name="cloud-upload-outline" size={24} color="#007AFF" />
            <Text style={styles.actionTitle}>Importar Backup</Text>
          </View>
          
          <Text style={styles.actionDescription}>
            Selecciona un archivo de backup para restaurar tus datos.
          </Text>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={16} color="#007AFF" />
              <Text style={styles.featureText}>Compatible con archivos .ccbackup y .json</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={16} color="#007AFF" />
              <Text style={styles.featureText}>Validación automática de datos</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="warning" size={16} color="#ff6b35" />
              <Text style={[styles.featureText, styles.warningText]}>
                Reemplazará todos los datos actuales
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.importButton]}
            onPress={handleImport}
            disabled={importLoading}
          >
            {importLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="folder-open" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Seleccionar Archivo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Botón cerrar */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sizeInfo: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sizeText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  features: {
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  warningText: {
    color: '#ff6b35',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minHeight: 44,
  },
  exportButton: {
    backgroundColor: '#28a745',
  },
  importButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
});

export default BackupModal;
