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
import { useSettings } from '../hooks/useSettings';
import CurrencySelector from '../components/CurrencySelector';
import ModeSelector from '../components/ModeSelector';
import AccountManager from '../components/AccountManager';
import CategoryManager from '../components/CategoryManager';
import CustomModal from '../components/CustomModal';
import BackupModal from '../components/BackupModal';

const SettingsScreen = () => {
  const {
    settings,
    loading,
    updateSettings,
    resetSettings,
    formatCurrency,
    addAccount,
    updateAccount,
    deleteAccount,
    setDefaultAccount,
    getAccountBalance,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategories
  } = useSettings();

  const [showExportModal, setShowExportModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
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
      const result = await StorageManager.exportCompressedBackup();
      Alert.alert(
        'Éxito', 
        result.message + '\n\nEl archivo incluye todas tus transacciones, configuraciones, categorías y cuentas.',
        [{ text: 'OK', onPress: () => setShowBackupModal(false) }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', error.message || 'No se pudo crear el backup');
    }
  }, []);

  const handleImportData = useCallback(async () => {
    try {
      const result = await StorageManager.importFromFile();
      
      Alert.alert(
        'Importación exitosa',
        `Se han importado:\n• ${result.transactionCount} transacciones\n• ${result.hasSettings ? 'Configuraciones' : 'Sin configuraciones'}\n• ${result.hasCategories ? 'Categorías personalizadas' : 'Sin categorías'}\n• ${result.hasAccounts ? 'Cuentas' : 'Sin cuentas'}`,
        [{ 
          text: 'OK', 
          onPress: () => {
            setShowBackupModal(false);
            loadStorageInfo();
          }
        }]
      );
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('Error', error.message || 'No se pudieron importar los datos');
    }
  }, [loadStorageInfo]);

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

  const handleCurrencyChange = useCallback((currency, symbol) => {
    updateSettings({ 
      currency, 
      currencySymbol: symbol 
    });
    Alert.alert('Éxito', 'Moneda actualizada correctamente');
    setShowCurrencyModal(false);
  }, [updateSettings]);

  const handleModeChange = useCallback((mode) => {
    updateSettings({ mode });
    Alert.alert('Éxito', `Modo cambiado a ${mode === 'basic' ? 'Básico' : 'Semi-Profesional'}`);
    setShowModeModal(false);
  }, [updateSettings]);

  const getModeInfo = () => {
    if (!settings) return { title: 'Cargando...', subtitle: '' };
    
    return settings.mode === 'basic' 
      ? { title: 'Modo Básico', subtitle: 'Solo ingresos y gastos' }
      : { title: 'Modo Semi-Profesional', subtitle: 'Gestión completa con cuentas' };
  };

  const getCurrencyInfo = () => {
    if (!settings) return { title: 'Cargando...', subtitle: '' };
    
    return {
      title: `${settings.currency || 'EUR'} - ${settings.currencySymbol || '€'}`,
      subtitle: 'Moneda predeterminada'
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando configuración...</Text>
      </View>
    );
  }

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

  const CurrencyModal = () => (
    <CustomModal
      isVisible={showCurrencyModal}
      onClose={() => setShowCurrencyModal(false)}
      title="Seleccionar Moneda"
      size="large"
    >
      <CurrencySelector
        selectedCurrency={settings?.currency || 'EUR'}
        onCurrencySelect={handleCurrencyChange}
      />
    </CustomModal>
  );

  const ModeModal = () => (
    <CustomModal
      isVisible={showModeModal}
      onClose={() => setShowModeModal(false)}
      title="Seleccionar Modo"
      size="large"
    >
      <ModeSelector
        selectedMode={settings?.mode || 'basic'}
        onModeSelect={handleModeChange}
      />
    </CustomModal>
  );

  const AccountModal = () => (
    <CustomModal
      isVisible={showAccountModal}
      onClose={() => setShowAccountModal(false)}
      title="Gestionar Cuentas"
      size="large"
    >
      <AccountManager
        accounts={settings?.accounts || []}
        onAddAccount={addAccount}
        onUpdateAccount={updateAccount}
        onDeleteAccount={deleteAccount}
        onSetDefault={setDefaultAccount}
        getAccountBalance={getAccountBalance}
        formatCurrency={formatCurrency}
      />
    </CustomModal>
  );

  const CategoryModal = () => (
    <CustomModal
      isVisible={showCategoryModal}
      onClose={() => setShowCategoryModal(false)}
      title="Gestionar Categorías"
      size="large"
    >
      <CategoryManager
        categories={settings?.categories || { expense: [], income: [] }}
        onAddCategory={addCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
      />
    </CustomModal>
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

        {/* App Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración de la aplicación</Text>
          
          <SettingItem
            icon="globe"
            title={getCurrencyInfo().title}
            subtitle={getCurrencyInfo().subtitle}
            onPress={() => setShowCurrencyModal(true)}
          />
          
          <SettingItem
            icon="settings"
            title={getModeInfo().title}
            subtitle={getModeInfo().subtitle}
            onPress={() => setShowModeModal(true)}
          />

          {settings?.mode === 'semi-professional' && (
            <SettingItem
              icon="card"
              title="Gestionar cuentas"
              subtitle="Bancos, tarjetas y efectivo"
              onPress={() => setShowAccountModal(true)}
            />
          )}

          <SettingItem
            icon="list"
            title="Gestionar categorías"
            subtitle="Tipos de ingresos y gastos"
            onPress={() => setShowCategoryModal(true)}
          />
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestión de datos</Text>
          
          <SettingItem
            icon="archive"
            title="Backup y Restauración"
            subtitle="Gestionar copias de seguridad comprimidas"
            onPress={() => setShowBackupModal(true)}
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
            <Text style={styles.developerInfo}>
              Desarrollado por Adrian Hinojosa
            </Text>
            <TouchableOpacity 
              style={styles.githubLink}
              onPress={() => {
                if (Platform.OS === 'web') {
                  window.open('https://github.com/adrian04981/CuentasClaras', '_blank');
                } else {
                  // Para móvil usaríamos Linking
                  console.log('Abrir GitHub en móvil');
                }
              }}
            >
              <Ionicons name="logo-github" size={16} color="#007AFF" />
              <Text style={styles.githubText}>Ver código fuente</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <BackupModal
        visible={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onExport={handleExportData}
        onImport={handleImportData}
        storageInfo={storageInfo}
      />
      <CurrencyModal />
      <ModeModal />
      <AccountModal />
      <CategoryModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  developerInfo: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  githubLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  githubText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
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
