import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EXPENSE_CATEGORIES = [
  'Comida',
  'Bebidas',
  'Transporte',
  'Entretenimiento',
  'Decoración',
  'Otros'
];

const PartyExpenseForm = ({ party, expense = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    description: expense?.description || '',
    amount: expense?.amount?.toString() || '',
    paidBy: expense?.paidBy || '',
    splitType: expense?.splitType || 'equal',
    splitData: expense?.splitData || {},
    category: expense?.category || 'Otros',
    date: expense?.date || new Date().toISOString().split('T')[0]
  });

  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleSubmit = () => {
    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Debe ingresar un monto válido');
      return;
    }

    if (!formData.paidBy) {
      Alert.alert('Error', 'Debe seleccionar quién pagó');
      return;
    }

    // Validate custom split
    if (formData.splitType === 'custom') {
      const totalAssigned = Object.values(formData.splitData).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
      const totalAmount = parseFloat(formData.amount);
      
      if (Math.abs(totalAmount - totalAssigned) > 0.01) {
        Alert.alert(
          'Error en división personalizada',
          `El total asignado (${formatCurrency(totalAssigned)}) no coincide con el monto total (${formatCurrency(totalAmount)}).`,
          [
            { text: 'Corregir', style: 'cancel' },
            { 
              text: 'Ajustar automáticamente', 
              onPress: () => {
                // Adjust the split to match the total
                const difference = totalAmount - totalAssigned;
                const participantsWithAmount = Object.keys(formData.splitData).filter(id => parseFloat(formData.splitData[id]) > 0);
                
                if (participantsWithAmount.length > 0) {
                  const adjustmentPerPerson = difference / participantsWithAmount.length;
                  const newSplitData = { ...formData.splitData };
                  
                  participantsWithAmount.forEach(participantId => {
                    newSplitData[participantId] = (parseFloat(newSplitData[participantId]) + adjustmentPerPerson).toFixed(2);
                  });
                  
                  setFormData(prev => ({ ...prev, splitData: newSplitData }));
                  Alert.alert('Ajuste realizado', 'La división ha sido ajustada automáticamente');
                }
              }
            }
          ]
        );
        return;
      }
    }

    // Auto-generate equal split if not custom
    let splitData = formData.splitData;
    if (formData.splitType === 'equal') {
      const amountPerPerson = parseFloat(formData.amount) / party.participants.length;
      splitData = {};
      party.participants.forEach(participant => {
        splitData[participant.id] = amountPerPerson;
      });
    }

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      splitData
    });
  };

  const getParticipantName = (participantId) => {
    const participant = party.participants.find(p => p.id === participantId);
    return participant ? participant.name : 'Seleccionar';
  };

  const calculateSplitPreview = () => {
    if (formData.splitType === 'equal' && formData.amount) {
      const amountPerPerson = parseFloat(formData.amount) / party.participants.length;
      return `${formatCurrency(amountPerPerson)} por persona`;
    } else if (formData.splitType === 'custom') {
      const totalCustom = Object.values(formData.splitData).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
      const remainingAmount = parseFloat(formData.amount || 0) - totalCustom;
      return `Total asignado: ${formatCurrency(totalCustom)} | Falta: ${formatCurrency(remainingAmount)}`;
    }
    return '';
  };

  const handleCustomSplitChange = (participantId, amount) => {
    setFormData(prev => ({
      ...prev,
      splitData: {
        ...prev.splitData,
        [participantId]: amount
      }
    }));
  };

  const resetCustomSplit = () => {
    setFormData(prev => ({
      ...prev,
      splitData: {}
    }));
  };

  const distributeEqually = () => {
    if (!formData.amount) {
      Alert.alert('Error', 'Primero ingrese el monto total');
      return;
    }
    
    const amountPerPerson = parseFloat(formData.amount) / party.participants.length;
    const newSplitData = {};
    party.participants.forEach(participant => {
      newSplitData[participant.id] = amountPerPerson.toFixed(2);
    });
    
    setFormData(prev => ({
      ...prev,
      splitData: newSplitData
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {expense ? 'Editar Gasto' : 'Nuevo Gasto'}
        </Text>
        <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
          <Text style={styles.saveText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form}>
        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={styles.input}
            value={formData.description}
            onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
            placeholder="Ej: Cena en restaurante"
            placeholderTextColor="#999"
          />
        </View>

        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Monto *</Text>
          <TextInput
            style={styles.input}
            value={formData.amount}
            onChangeText={(value) => setFormData(prev => ({ ...prev, amount: value }))}
            placeholder="0.00"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Paid By */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pagado por *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowParticipantModal(true)}
          >
            <Text style={[styles.selectText, !formData.paidBy && styles.placeholder]}>
              {formData.paidBy ? getParticipantName(formData.paidBy) : 'Seleccionar participante'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoría</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.selectText}>{formData.category}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Split Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>División del gasto</Text>
          <View style={styles.splitTypeContainer}>
            <TouchableOpacity
              style={[
                styles.splitTypeButton,
                formData.splitType === 'equal' && styles.splitTypeButtonActive
              ]}
              onPress={() => setFormData(prev => ({ ...prev, splitType: 'equal', splitData: {} }))}
            >
              <Text style={[
                styles.splitTypeText,
                formData.splitType === 'equal' && styles.splitTypeTextActive
              ]}>
                División Igual
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.splitTypeButton,
                formData.splitType === 'custom' && styles.splitTypeButtonActive
              ]}
              onPress={() => setFormData(prev => ({ ...prev, splitType: 'custom' }))}
            >
              <Text style={[
                styles.splitTypeText,
                formData.splitType === 'custom' && styles.splitTypeTextActive
              ]}>
                División Personalizada
              </Text>
            </TouchableOpacity>
          </View>
          
          {formData.amount && (
            <Text style={styles.splitPreview}>
              {calculateSplitPreview()}
            </Text>
          )}
        </View>

        {/* Custom Split Details */}
        {formData.splitType === 'custom' && (
          <View style={styles.inputGroup}>
            <View style={styles.customSplitHeader}>
              <Text style={styles.label}>Asignar montos individuales</Text>
              <View style={styles.customSplitActions}>
                <TouchableOpacity
                  style={styles.customActionButton}
                  onPress={distributeEqually}
                >
                  <Text style={styles.customActionText}>Repartir igual</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.customActionButton, styles.resetButton]}
                  onPress={resetCustomSplit}
                >
                  <Text style={[styles.customActionText, styles.resetText]}>Limpiar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.customSplitContainer}>
              <Text style={styles.customSplitHelp}>
                💡 Ejemplo: Fueron al restaurante, Juan pagó S/200 con su tarjeta:{'\n'}
                • María pidió S/45 → ingresar 45{'\n'}
                • Pedro pidió S/60 → ingresar 60{'\n'}
                • Ana llegó tarde, no pidió nada → dejar en 0{'\n'}
                • Juan pidió S/95 → ingresar 95{'\n'}
                Total: S/200 ✓
              </Text>

              {party.participants.map((participant) => (
                <View key={participant.id} style={styles.participantSplitItem}>
                  <View style={styles.participantSplitInfo}>
                    <Ionicons name="person" size={16} color="#666" />
                    <Text style={styles.participantSplitName}>{participant.name}</Text>
                  </View>
                  <TextInput
                    style={styles.participantSplitInput}
                    value={formData.splitData[participant.id]?.toString() || ''}
                    onChangeText={(value) => handleCustomSplitChange(participant.id, value)}
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
              ))}

              {formData.amount && (
                <View style={styles.splitSummary}>
                  <View style={styles.splitSummaryRow}>
                    <Text style={styles.splitSummaryLabel}>Total del gasto:</Text>
                    <Text style={styles.splitSummaryValue}>
                      {formatCurrency(parseFloat(formData.amount))}
                    </Text>
                  </View>
                  <View style={styles.splitSummaryRow}>
                    <Text style={styles.splitSummaryLabel}>Total asignado:</Text>
                    <Text style={styles.splitSummaryValue}>
                      {formatCurrency(Object.values(formData.splitData).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0))}
                    </Text>
                  </View>
                  {(() => {
                    const totalAssigned = Object.values(formData.splitData).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
                    const difference = parseFloat(formData.amount) - totalAssigned;
                    return (
                      <View style={styles.splitSummaryRow}>
                        <Text style={styles.splitSummaryLabel}>
                          {difference > 0 ? 'Falta asignar:' : difference < 0 ? 'Exceso:' : 'Balance:'}
                        </Text>
                        <Text style={[
                          styles.splitSummaryValue,
                          difference > 0 ? styles.splitWarning : difference < 0 ? styles.splitError : styles.splitSuccess
                        ]}>
                          {formatCurrency(Math.abs(difference))}
                        </Text>
                      </View>
                    );
                  })()}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fecha</Text>
          <TextInput
            style={styles.input}
            value={formData.date}
            onChangeText={(value) => setFormData(prev => ({ ...prev, date: value }))}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
          />
        </View>
      </ScrollView>

      {/* Participant Selection Modal */}
      <Modal
        visible={showParticipantModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Participante</Text>
              <TouchableOpacity onPress={() => setShowParticipantModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {party.participants.map((participant) => (
                <TouchableOpacity
                  key={participant.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, paidBy: participant.id }));
                    setShowParticipantModal(false);
                  }}
                >
                  <Ionicons name="person" size={20} color="#007AFF" />
                  <Text style={styles.modalItemText}>{participant.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
            
            <ScrollView style={styles.modalList}>
              {EXPENSE_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, category }));
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
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
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  splitTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  splitTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  splitTypeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  splitTypeText: {
    fontSize: 14,
    color: '#666',
  },
  splitTypeTextActive: {
    color: '#fff',
  },
  splitPreview: {
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
    marginTop: 8,
  },
  customSplitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customSplitActions: {
    flexDirection: 'row',
    gap: 8,
  },
  customActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  resetButton: {
    backgroundColor: '#6c757d',
  },
  customActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  resetText: {
    color: '#fff',
  },
  customSplitContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  customSplitHelp: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 6,
    lineHeight: 18,
  },
  participantSplitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  participantSplitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantSplitName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  participantSplitInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    width: 80,
    textAlign: 'right',
  },
  splitSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  splitSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  splitSummaryLabel: {
    fontSize: 14,
    color: '#495057',
  },
  splitSummaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  splitWarning: {
    color: '#FF9500',
  },
  splitError: {
    color: '#FF3B30',
  },
  splitSuccess: {
    color: '#34C759',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});

export default PartyExpenseForm;
