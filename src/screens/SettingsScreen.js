import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Share,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StorageManager from '../utils/storage';

const SettingsScreen = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [storageInfo, setStorageInfo] = useState(null);

  React.useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = useCallback(() => {
    const info = StorageManager.getStorageInfo();
    setStorageInfo(info);
  }, []);

  const handleExportData = useCallback(async () => {
    try {
      const data = StorageManager.exportData();
      const jsonString = JSON.stringify(data, null, 2);
      
      if (Platform.OS === 'web') {
        // For web, download as file
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cuentas-claras-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Alert.alert('Éxito', 'Backup descargado correctamente');
      } else {
        // For mobile, use share
        await Share.share({
          message: jsonString,
          title: 'Backup Cuentas Claras',
        });
      }
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'No se pudo exportar los datos');
    }
  }, []);

  const handleImportData = useCallback(() => {
    try {
      if (!importData.trim()) {
        Alert.alert('Error', 'Por favor pega los datos del backup');
        return;
      }

      const data = JSON.parse(importData);
      
      if (!data.transactions || !Array.isArray(data.transactions)) {
        Alert.alert('Error', 'Formato de datos inválido');
        return;
      }

      Alert.alert(
        'Confirmar importación',
        `¿Estás seguro de que quieres importar ${data.transactions.length} transacciones? Esto reemplazará todos tus datos actuales.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Importar',
            style: 'destructive',
            onPress: () => {
              const success = StorageManager.importData(data);
              if (success) {
                Alert.alert('Éxito', 'Datos importados correctamente');
                setImportData('');
                setShowImportModal(false);
                loadStorageInfo();
              } else {
                Alert.alert('Error', 'No se pudieron importar los datos');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('Error', 'Formato de datos inválido');
    }
  }, [importData, loadStorageInfo]);

  const handleClearAllData = useCallback(() => {
    Alert.alert(
      'Eliminar todos los datos',
      '¿Estás seguro de que quieres eliminar todas tus transacciones y configuraciones? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const success = StorageManager.clearAllData();
            if (success) {
              Alert.alert('Éxito', 'Todos los datos han sido eliminados');
              loadStorageInfo();
            } else {
              Alert.alert('Error', 'No se pudieron eliminar los datos');
            }
          }
        }
      ]
    );
  }, [loadStorageInfo]);

  const SettingItem = ({ icon, title, subtitle, onPress, danger = false }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={danger ? '#FF3B30' : '#007AFF'} 
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
    </TouchableOpacity>
  );

  const ExportModal = () => (
    <Modal
      visible={showExportModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Exportar Datos</Text>
            <TouchableOpacity onPress={() => setShowExportModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color="#007AFF" />
              <Text style={styles.infoText}>
                Se creará un archivo de backup con todas tus transacciones y configuraciones.
                Guarda este archivo en un lugar seguro.
              </Text>
            </View>
            
            {storageInfo && (
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Información del backup:</Text>
                <Text style={styles.statsItem}>
                  • {storageInfo.transactionsCount} transacciones
                </Text>
                <Text style={styles.statsItem}>
                  • Tamaño: {storageInfo.formattedSize}
                </Text>
                <Text style={styles.statsItem}>
                  • Fecha: {new Date().toLocaleDateString('es-ES')}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowExportModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.exportButton} 
              onPress={handleExportData}
            >
              <Ionicons name="download" size={16} color="#fff" />
              <Text style={styles.exportButtonText}>Exportar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const ImportModal = () => (
    <Modal
      visible={showImportModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Importar Datos</Text>
            <TouchableOpacity onPress={() => setShowImportModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <View style={[styles.infoCard, styles.warningCard]}>
              <Ionicons name="warning" size={24} color="#FF9500" />
              <Text style={styles.infoText}>
                ¡Atención! Importar datos reemplazará toda tu información actual.
                Asegúrate de tener un backup antes de continuar.
              </Text>
            </View>
            
            <Text style={styles.inputLabel}>
              Pega aquí el contenido del archivo de backup:
            </Text>
            
            <TextInput
              style={styles.importTextArea}
              value={importData}
              onChangeText={setImportData}
              placeholder="Pega el contenido JSON del backup aquí..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={8}
            />
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => {
                setShowImportModal(false);
                setImportData('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.importButton, !importData.trim() && styles.disabledButton]} 
              onPress={handleImportData}
              disabled={!importData.trim()}
            >
              <Ionicons name="cloud-upload" size={16} color="#fff" />
              <Text style={styles.importButtonText}>Importar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Configuración</Text>
        </View>

        {/* Storage Info */}
        {storageInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de almacenamiento</Text>
            <View style={styles.storageCard}>
              <View style={styles.storageItem}>
                <Text style={styles.storageLabel}>Transacciones</Text>
                <Text style={styles.storageValue}>{storageInfo.transactionsCount}</Text>
              </View>
              <View style={styles.storageItem}>
                <Text style={styles.storageLabel}>Espacio usado</Text>
                <Text style={styles.storageValue}>{storageInfo.formattedSize}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestión de datos</Text>
          
          <SettingItem
            icon="download"
            title="Exportar datos"
            subtitle="Crear backup de todas tus transacciones"
            onPress={() => setShowExportModal(true)}
          />
          
          <SettingItem
            icon="cloud-upload"
            title="Importar datos"
            subtitle="Restaurar desde un archivo de backup"
            onPress={() => setShowImportModal(true)}
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Zona de peligro</Text>
          
          <SettingItem
            icon="trash"
            title="Eliminar todos los datos"
            subtitle="Borra permanentemente todas las transacciones"
            onPress={handleClearAllData}
            danger={true}
          />
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          <View style={styles.infoSection}>
            <Text style={styles.appName}>Cuentas Claras</Text>
            <Text style={styles.appVersion}>Versión 1.0.0</Text>
            <Text style={styles.appDescription}>
              Aplicación de gestión financiera personal desarrollada con React Native.
              Todos los datos se almacenan localmente en tu dispositivo.
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <ExportModal />
      <ImportModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  dangerTitle: {
    color: '#FF3B30',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  dangerText: {
    color: '#FF3B30',
  },
  storageCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  storageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  storageLabel: {
    fontSize: 14,
    color: '#666',
  },
  storageValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e6f3ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  warningCard: {
    backgroundColor: '#fff3e0',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  statsItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  importTextArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 120,
    backgroundColor: '#f8f9fa',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    gap: 8,
  },
  exportButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  importButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#34C759',
    gap: 8,
  },
  importButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default SettingsScreen;
