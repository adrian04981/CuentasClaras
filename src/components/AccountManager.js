import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ACCOUNT_TYPES = [
  { key: 'checking', label: 'Cuenta Corriente', icon: 'card' },
  { key: 'savings', label: 'Cuenta de Ahorros', icon: 'wallet' },
  { key: 'credit', label: 'Tarjeta de Crédito', icon: 'card-outline' },
  { key: 'cash', label: 'Efectivo', icon: 'cash' },
  { key: 'investment', label: 'Inversiones', icon: 'trending-up' }
];

const BANK_COLORS = [
  '#007AFF', '#FF3B30', '#34C759', '#FF9500', '#AF52DE',
  '#FF2D92', '#5AC8FA', '#FFCC00', '#8E8E93', '#000000'
];

const AccountManager = ({ 
  accounts, 
  onAddAccount, 
  onUpdateAccount, 
  onDeleteAccount,
  onSetDefault,
  defaultAccount,
  formatCurrency,
  getAccountBalance 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    bank: '',
    initialBalance: '',
    color: BANK_COLORS[0]
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'checking',
      bank: '',
      initialBalance: '',
      color: BANK_COLORS[0]
    });
    setEditingAccount(null);
  };

  const handleOpenModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        bank: account.bank || '',
        initialBalance: account.initialBalance?.toString() || '',
        color: account.color || BANK_COLORS[0]
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre de la cuenta es obligatorio');
      return;
    }

    const accountData = {
      name: formData.name.trim(),
      type: formData.type,
      bank: formData.bank.trim(),
      initialBalance: parseFloat(formData.initialBalance) || 0,
      color: formData.color
    };

    if (editingAccount) {
      onUpdateAccount(editingAccount.id, accountData);
    } else {
      onAddAccount(accountData);
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (account) => {
    Alert.alert(
      'Eliminar cuenta',
      `¿Estás seguro de que quieres eliminar "${account.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: () => onDeleteAccount(account.id) 
        }
      ]
    );
  };

  const getAccountTypeInfo = (type) => {
    return ACCOUNT_TYPES.find(t => t.key === type) || ACCOUNT_TYPES[0];
  };

  const AccountCard = ({ account }) => {
    const typeInfo = getAccountTypeInfo(account.type);
    const currentBalance = getAccountBalance(account.id);
    const isDefault = account.id === defaultAccount;

    return (
      <View style={[styles.accountCard, { borderLeftColor: account.color }]}>
        <View style={styles.accountHeader}>
          <View style={styles.accountInfo}>
            <View style={styles.accountTitleRow}>
              <Ionicons name={typeInfo.icon} size={20} color={account.color} />
              <Text style={styles.accountName}>{account.name}</Text>
              {isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Por defecto</Text>
                </View>
              )}
            </View>
            <Text style={styles.accountType}>{typeInfo.label}</Text>
            {account.bank && (
              <Text style={styles.accountBank}>{account.bank}</Text>
            )}
          </View>
          
          <View style={styles.accountActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleOpenModal(account)}
            >
              <Ionicons name="pencil" size={16} color="#007AFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDelete(account)}
            >
              <Ionicons name="trash" size={16} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Balance actual:</Text>
          <Text style={[
            styles.balanceAmount,
            { color: currentBalance >= 0 ? '#34C759' : '#FF3B30' }
          ]}>
            {formatCurrency(currentBalance)}
          </Text>
        </View>

        {!isDefault && (
          <TouchableOpacity 
            style={styles.setDefaultButton}
            onPress={() => onSetDefault(account.id)}
          >
            <Text style={styles.setDefaultText}>Establecer como predeterminada</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cuentas y Tarjetas</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => handleOpenModal()}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.accountsList}>
        {accounts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay cuentas registradas</Text>
            <Text style={styles.emptySubtext}>
              Agrega tu primera cuenta para empezar a gestionar tus finanzas
            </Text>
          </View>
        ) : (
          accounts.map(account => (
            <AccountCard key={account.id} account={account} />
          ))
        )}
      </ScrollView>

      {/* Add/Edit Account Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre de la cuenta *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
                  placeholder="Ej: Banco Santander Principal"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de cuenta</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.typeSelector}
                >
                  {ACCOUNT_TYPES.map(type => (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.typeButton,
                        formData.type === type.key && styles.selectedType
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, type: type.key }))}
                    >
                      <Ionicons 
                        name={type.icon} 
                        size={20} 
                        color={formData.type === type.key ? '#fff' : '#666'} 
                      />
                      <Text style={[
                        styles.typeText,
                        formData.type === type.key && styles.selectedTypeText
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Banco/Entidad</Text>
                <TextInput
                  style={styles.input}
                  value={formData.bank}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, bank: value }))}
                  placeholder="Ej: Banco Santander, BBVA, etc."
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Balance inicial</Text>
                <TextInput
                  style={styles.input}
                  value={formData.initialBalance}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, initialBalance: value }))}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Color identificativo</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.colorSelector}
                >
                  {BANK_COLORS.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorButton,
                        { backgroundColor: color },
                        formData.color === color && styles.selectedColor
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, color }))}
                    >
                      {formData.color === color && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {editingAccount ? 'Actualizar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  accountsList: {
    flex: 1,
    padding: 16,
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  accountType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  accountBank: {
    fontSize: 12,
    color: '#999',
  },
  accountActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  setDefaultButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  setDefaultText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  typeSelector: {
    marginTop: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
    gap: 8,
    minWidth: 120,
  },
  selectedType: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedTypeText: {
    color: '#fff',
    fontWeight: '600',
  },
  colorSelector: {
    marginTop: 8,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default AccountManager;
