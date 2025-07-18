import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TransactionForm = ({ 
  onSubmit, 
  editTransaction = null, 
  onCancel,
  settings = null,
  formatCurrency = (amount) => `€${amount}` 
}) => {
  const CATEGORIES = settings?.categories || {
    expense: [
      'Alimentación', 'Transporte', 'Entretenimiento', 'Salud', 
      'Educación', 'Hogar', 'Ropa', 'Servicios', 'Otros'
    ],
    income: [
      'Salario', 'Freelance', 'Inversiones', 'Ventas', 
      'Bonos', 'Regalos', 'Otros'
    ]
  };

  const mode = settings?.mode || 'basic';
  const accounts = settings?.accounts || [];
  const defaultAccount = settings?.defaultAccount || null;
  const [type, setType] = useState(editTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '');
  const [category, setCategory] = useState(editTransaction?.category || '');
  const [description, setDescription] = useState(editTransaction?.description || '');
  const [date, setDate] = useState(editTransaction?.date || new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(editTransaction?.accountId || defaultAccount || '');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const handleSubmit = () => {
    if (!amount || !category || !description) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (mode === 'semi-professional' && accounts.length > 0 && !accountId) {
      Alert.alert('Error', 'Por favor selecciona una cuenta');
      return;
    }

    const transaction = {
      type,
      amount: parseFloat(amount),
      category,
      description,
      date,
      accountId: mode === 'semi-professional' ? accountId : null
    };

    if (editTransaction) {
      onSubmit(editTransaction.id, transaction);
    } else {
      onSubmit(transaction);
    }

    // Reset form if not editing
    if (!editTransaction) {
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setAccountId(defaultAccount || '');
    }
  };

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setAccountId(defaultAccount || '');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {editTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
        </Text>
        {editTransaction && (
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.form}>
        {/* Type Selector */}
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
            onPress={() => setType('expense')}
          >
            <Ionicons 
              name="remove-circle" 
              size={20} 
              color={type === 'expense' ? '#fff' : '#e74c3c'} 
            />
            <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
              Gasto
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
            onPress={() => setType('income')}
          >
            <Ionicons 
              name="add-circle" 
              size={20} 
              color={type === 'income' ? '#fff' : '#27ae60'} 
            />
            <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
              Ingreso
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Monto</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        {/* Account Selector - Only in semi-professional mode */}
        {mode === 'semi-professional' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cuenta</Text>
            {accounts.length === 0 ? (
              <View style={styles.noAccountsContainer}>
                <Text style={styles.noAccountsText}>
                  No hay cuentas disponibles. Ve a Configuración para crear una cuenta.
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => setShowAccountModal(true)}
              >
                <Text style={[styles.categoryText, !accountId && styles.placeholder]}>
                  {accountId ? 
                    accounts.find(a => a.id === accountId)?.name || 'Seleccionar cuenta' : 
                    'Seleccionar cuenta'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Category Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoría</Text>
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={[styles.categoryText, !category && styles.placeholder]}>
              {category || 'Seleccionar categoría'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción de la transacción"
            placeholderTextColor="#999"
          />
        </View>

        {/* Date Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fecha</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {editTransaction ? 'Actualizar' : 'Agregar'}
            </Text>
          </TouchableOpacity>
          
          {!editTransaction && (
            <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
              <Text style={styles.resetButtonText}>Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.categoryList}>
              {CATEGORIES[type].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.categoryItem}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.categoryItemText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Account Selection Modal - Only in semi-professional mode */}
      {mode === 'semi-professional' && (
        <Modal
          visible={showAccountModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Cuenta</Text>
                <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.categoryList}>
                {accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={styles.categoryItem}
                    onPress={() => {
                      setAccountId(account.id);
                      setShowAccountModal(false);
                    }}
                  >
                    <View style={styles.accountItem}>
                      <View style={[styles.accountColor, { backgroundColor: account.color }]} />
                      <View style={styles.accountInfo}>
                        <Text style={styles.accountName}>{account.name}</Text>
                        <Text style={styles.accountType}>{account.bank || account.type}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    padding: 5,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    padding: 4,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 6,
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  typeTextActive: {
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 16,
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
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
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
    maxHeight: '70%',
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
  categoryList: {
    padding: 20,
  },
  categoryItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  accountType: {
    fontSize: 14,
    color: '#666',
  },
  noAccountsContainer: {
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  noAccountsText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
});

export default TransactionForm;
