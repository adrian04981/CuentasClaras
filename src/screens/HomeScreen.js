import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import { useTransactions } from '../hooks/useTransactions';
import { useSettings } from '../hooks/useSettings';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import FinancialSummary from '../components/FinancialSummary';
import MonthSelector from '../components/MonthSelector';

const HomeScreen = () => {
  const {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByMonth,
    reload
  } = useTransactions();

  const {
    settings,
    formatCurrency
  } = useSettings();

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get transactions for selected month
  const monthTransactions = getTransactionsByMonth(selectedYear, selectedMonth);

  const handleAddTransaction = useCallback((transaction) => {
    const success = addTransaction(transaction);
    if (success) {
      Alert.alert('Éxito', 'Transacción agregada correctamente');
    } else {
      Alert.alert('Error', 'No se pudo agregar la transacción');
    }
  }, [addTransaction]);

  const handleUpdateTransaction = useCallback((id, updates) => {
    const success = updateTransaction(id, updates);
    if (success) {
      setEditingTransaction(null);
      Alert.alert('Éxito', 'Transacción actualizada correctamente');
    } else {
      Alert.alert('Error', 'No se pudo actualizar la transacción');
    }
  }, [updateTransaction]);

  const handleDeleteTransaction = useCallback((id) => {
    const success = deleteTransaction(id);
    if (success) {
      Alert.alert('Éxito', 'Transacción eliminada correctamente');
    } else {
      Alert.alert('Error', 'No se pudo eliminar la transacción');
    }
  }, [deleteTransaction]);

  const handleEditTransaction = useCallback((transaction) => {
    setEditingTransaction(transaction);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingTransaction(null);
  }, []);

  const handleMonthChange = useCallback((year, month) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Transaction Form */}
        <View style={styles.formSection}>
          <TransactionForm
            onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
            editTransaction={editingTransaction}
            onCancel={handleCancelEdit}
            settings={settings}
            formatCurrency={formatCurrency}
          />
        </View>

        {/* Month Selector */}
        <MonthSelector
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
        />

        {/* Financial Summary */}
        <FinancialSummary
          transactions={monthTransactions}
          period={`${MONTHS[selectedMonth]} ${selectedYear}`}
          formatCurrency={formatCurrency}
        />

        {/* Transaction List */}
        <View style={styles.listSection}>
          <TransactionList
            transactions={monthTransactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            title={`Transacciones - ${MONTHS[selectedMonth]} ${selectedYear}`}
            emptyMessage="No hay transacciones en este período"
            formatCurrency={formatCurrency}
          />
        </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  formSection: {
    backgroundColor: '#fff',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listSection: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default HomeScreen;
