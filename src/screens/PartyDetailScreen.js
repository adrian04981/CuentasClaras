import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StorageManager from '../utils/storage';
import PartyExpenseForm from '../components/PartyExpenseForm';

const PartyDetailScreen = ({ route, navigation }) => {
  const { partyId } = route.params;
  const [party, setParty] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartyData();
  }, [partyId]);

  const loadPartyData = () => {
    try {
      const partyData = StorageManager.getParties().find(p => p.id === partyId);
      const summaryData = StorageManager.getPartySummary(partyId);
      
      setParty(partyData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading party data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de la fiesta');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleAddExpense = async (expenseData) => {
    try {
      const newExpense = StorageManager.addPartyExpense({
        ...expenseData,
        partyId
      });
      
      if (newExpense) {
        loadPartyData();
        setShowExpenseModal(false);
        Alert.alert('Éxito', 'Gasto agregado correctamente');
      } else {
        Alert.alert('Error', 'No se pudo agregar el gasto');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'No se pudo agregar el gasto');
    }
  };

  const handleSettleParty = () => {
    Alert.alert(
      'Liquidar Fiesta',
      '¿Estás seguro de que quieres marcar esta fiesta como liquidada? Ya no podrás agregar más gastos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Liquidar',
          style: 'default',
          onPress: () => {
            if (StorageManager.updateParty(partyId, { status: 'settled' })) {
              loadPartyData();
              Alert.alert('Éxito', 'Fiesta liquidada correctamente');
            } else {
              Alert.alert('Error', 'No se pudo liquidar la fiesta');
            }
          }
        }
      ]
    );
  };

  if (loading || !party || !summary) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  const getParticipantName = (participantId) => {
    if (participantId === 'YO') return 'YO';
    const participant = party.participants.find(p => p.id === participantId);
    return participant ? participant.name : 'Desconocido';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Party Header */}
        <View style={styles.header}>
          <Text style={styles.partyName}>{party.name}</Text>
          {party.description && (
            <Text style={styles.partyDescription}>{party.description}</Text>
          )}
          
          <View style={styles.partyInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{party.date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                {party.participants.length} participantes
              </Text>
            </View>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Gastado</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.totalExpenses)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Gastos</Text>
              <Text style={styles.summaryValue}>{summary.expenseCount}</Text>
            </View>
          </View>
        </View>

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participantes</Text>
          {party.participants.map((participant) => (
            <View key={participant.id} style={styles.participantItem}>
              <View style={styles.participantInfo}>
                <Ionicons name="person" size={20} color="#007AFF" />
                <Text style={styles.participantName}>{participant.name}</Text>
              </View>
              <Text style={styles.participantBalance}>
                {formatCurrency(summary.balances[participant.id] || 0)}
              </Text>
            </View>
          ))}
        </View>

        {/* Settlements */}
        {summary.settlements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Liquidaciones Pendientes ({summary.settlements.length})
            </Text>
            {summary.settlements.map((settlement, index) => (
              <View key={index} style={styles.settlementItem}>
                <Text style={styles.settlementText}>
                  <Text style={styles.settlementFrom}>
                    {getParticipantName(settlement.from)}
                  </Text>
                  {' debe '}
                  <Text style={styles.settlementAmount}>
                    {formatCurrency(settlement.amount)}
                  </Text>
                  {' a '}
                  <Text style={styles.settlementTo}>
                    {getParticipantName(settlement.to)}
                  </Text>
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Expenses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Gastos ({summary.expenseCount})
            </Text>
            {party.status === 'active' && (
              <TouchableOpacity
                style={styles.addExpenseButton}
                onPress={() => setShowExpenseModal(true)}
              >
                <Ionicons name="add" size={20} color="#007AFF" />
                <Text style={styles.addExpenseText}>Agregar</Text>
              </TouchableOpacity>
            )}
          </View>

          {summary.expenses.length === 0 ? (
            <View style={styles.noExpenses}>
              <Text style={styles.noExpensesText}>No hay gastos registrados</Text>
            </View>
          ) : (
            summary.expenses.map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
                <View style={styles.expenseHeader}>
                  <Text style={styles.expenseDescription}>
                    {expense.description}
                    {expense.isPaidImmediately && (
                      <Text style={styles.immediatePaymentBadge}> 💰</Text>
                    )}
                  </Text>
                  <Text style={styles.expenseAmount}>
                    {formatCurrency(expense.amount)}
                  </Text>
                </View>
                <View style={styles.expenseFooter}>
                  <Text style={styles.expenseInfo}>
                    Pagado por: {getParticipantName(expense.paidBy)}
                    {expense.isPaidImmediately && (
                      <Text style={styles.immediatePaymentText}> (Inmediato)</Text>
                    )}
                  </Text>
                  <Text style={styles.expenseDate}>{expense.date}</Text>
                </View>
                
                {expense.isPaidImmediately ? (
                  <View style={styles.expenseSplitDetails}>
                    <Text style={styles.immediatePaymentInfo}>
                      ✅ Pagado inmediatamente - Sin deudas generadas
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Split details for custom expenses */}
                    {expense.splitType === 'custom' && (
                      <View style={styles.expenseSplitDetails}>
                        <Text style={styles.expenseSplitTitle}>División personalizada:</Text>
                        {Object.entries(expense.splitData).map(([participantId, amount]) => (
                          parseFloat(amount) > 0 && (
                            <Text key={participantId} style={styles.expenseSplitItem}>
                              • {getParticipantName(participantId)}: {formatCurrency(amount)}
                            </Text>
                          )
                        ))}
                      </View>
                    )}
                    
                    {expense.splitType === 'equal' && (
                      <View style={styles.expenseSplitDetails}>
                        <Text style={styles.expenseSplitItem}>
                          División igual: {formatCurrency(expense.amount / party.participants.length)} c/u
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            ))
          )}
        </View>

        {/* Actions */}
        {party.status === 'active' && summary.expenseCount > 0 && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.settleButton}
              onPress={handleSettleParty}
            >
              <Text style={styles.settleButtonText}>Liquidar Fiesta</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={showExpenseModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <PartyExpenseForm
          party={party}
          onSubmit={handleAddExpense}
          onCancel={() => setShowExpenseModal(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  partyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  partyDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  partyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addExpenseText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 4,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  participantBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  settlementItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  settlementText: {
    fontSize: 14,
    color: '#856404',
  },
  settlementFrom: {
    fontWeight: 'bold',
  },
  settlementTo: {
    fontWeight: 'bold',
  },
  settlementAmount: {
    fontWeight: 'bold',
    color: '#d63384',
  },
  noExpenses: {
    padding: 20,
    alignItems: 'center',
  },
  noExpensesText: {
    color: '#666',
    fontSize: 16,
  },
  expenseItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  expenseDescription: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expenseInfo: {
    fontSize: 12,
    color: '#666',
  },
  expenseDate: {
    fontSize: 12,
    color: '#666',
  },
  expenseSplitDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  expenseSplitTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  expenseSplitItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  immediatePaymentBadge: {
    fontSize: 14,
    color: '#34C759',
  },
  immediatePaymentText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  immediatePaymentInfo: {
    fontSize: 12,
    color: '#34C759',
    fontStyle: 'italic',
    backgroundColor: '#d4edda',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  actions: {
    padding: 16,
  },
  settleButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  settleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PartyDetailScreen;
