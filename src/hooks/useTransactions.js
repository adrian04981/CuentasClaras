import { useState, useEffect, useCallback } from 'react';
import StorageManager from '../utils/storage';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = useCallback(() => {
    setLoading(true);
    try {
      const data = StorageManager.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = useCallback((transaction) => {
    const success = StorageManager.addTransaction(transaction);
    if (success) {
      loadTransactions();
    }
    return success;
  }, [loadTransactions]);

  const updateTransaction = useCallback((id, updates) => {
    const success = StorageManager.updateTransaction(id, updates);
    if (success) {
      loadTransactions();
    }
    return success;
  }, [loadTransactions]);

  const deleteTransaction = useCallback((id) => {
    const success = StorageManager.deleteTransaction(id);
    if (success) {
      loadTransactions();
    }
    return success;
  }, [loadTransactions]);

  const getTransactionsByMonth = useCallback((year, month) => {
    return StorageManager.getTransactionsByMonth(year, month);
  }, []);

  const getTransactionsByDateRange = useCallback((startDate, endDate) => {
    return StorageManager.getTransactionsByDateRange(startDate, endDate);
  }, []);

  // Calculate totals
  const getTotals = useCallback((filteredTransactions = transactions) => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expenses,
      balance: income - expenses
    };
  }, [transactions]);

  // Get categories summary
  const getCategorySummary = useCallback((filteredTransactions = transactions) => {
    const summary = {};
    
    filteredTransactions.forEach(transaction => {
      const { category, type, amount } = transaction;
      if (!summary[category]) {
        summary[category] = { income: 0, expense: 0, total: 0 };
      }
      
      if (type === 'income') {
        summary[category].income += amount;
      } else {
        summary[category].expense += amount;
      }
      
      summary[category].total = summary[category].income - summary[category].expense;
    });
    
    return summary;
  }, [transactions]);

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByMonth,
    getTransactionsByDateRange,
    getTotals,
    getCategorySummary,
    reload: loadTransactions
  };
};
