import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FinancialSummary = ({ 
  transactions, 
  period = "Este mes",
  formatCurrency = (amount) => new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(Math.abs(amount))
}) => {
  const calculateTotals = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    
    return { income, expenses, balance };
  };

  const formatAmount = (amount) => {
    return formatCurrency(Math.abs(amount));
  };

  const { income, expenses, balance } = calculateTotals();

  const SummaryCard = ({ title, amount, type, icon }) => (
    <View style={[styles.card, styles[`${type}Card`]]}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={24} color={styles[`${type}Card`].borderColor} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={[styles.cardAmount, { color: styles[`${type}Card`].borderColor }]}>
        {type === 'income' && '+'}
        {type === 'expense' && '-'}
        {formatAmount(amount)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.periodTitle}>{period}</Text>
      
      <View style={styles.cardsContainer}>
        <SummaryCard
          title="Ingresos"
          amount={income}
          type="income"
          icon="add-circle"
        />
        
        <SummaryCard
          title="Gastos"
          amount={expenses}
          type="expense"
          icon="remove-circle"
        />
      </View>
      
      <View style={[
        styles.balanceCard,
        { backgroundColor: balance >= 0 ? '#e8f5e8' : '#fdeaea' }
      ]}>
        <View style={styles.balanceHeader}>
          <Ionicons 
            name={balance >= 0 ? "trending-up" : "trending-down"} 
            size={24} 
            color={balance >= 0 ? '#27ae60' : '#e74c3c'} 
          />
          <Text style={styles.balanceTitle}>Balance</Text>
        </View>
        <Text style={[
          styles.balanceAmount,
          { color: balance >= 0 ? '#27ae60' : '#e74c3c' }
        ]}>
          {balance >= 0 ? '+' : ''}{formatAmount(balance)}
        </Text>
        <Text style={styles.balanceSubtext}>
          {balance >= 0 ? 'Superávit' : 'Déficit'}
        </Text>
      </View>
      
      {transactions.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Transacciones</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {transactions.filter(t => t.type === 'income').length}
            </Text>
            <Text style={styles.statLabel}>Ingresos</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {transactions.filter(t => t.type === 'expense').length}
            </Text>
            <Text style={styles.statLabel}>Gastos</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  incomeCard: {
    borderColor: '#27ae60',
  },
  expenseCard: {
    borderColor: '#e74c3c',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  balanceCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default FinancialSummary;
