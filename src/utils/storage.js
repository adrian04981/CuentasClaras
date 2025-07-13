// Optimized storage utility for web localStorage
const STORAGE_KEYS = {
  TRANSACTIONS: 'cc_transactions',
  SETTINGS: 'cc_settings'
};

class StorageManager {
  // Get all transactions
  getTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  // Save transactions (optimized for space)
  saveTransactions(transactions) {
    try {
      // Compress data by removing unnecessary spaces
      const compressedData = JSON.stringify(transactions);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, compressedData);
      return true;
    } catch (error) {
      console.error('Error saving transactions:', error);
      return false;
    }
  }

  // Add single transaction
  addTransaction(transaction) {
    const transactions = this.getTransactions();
    const newTransaction = {
      id: Date.now().toString(),
      ...transaction,
      createdAt: new Date().toISOString()
    };
    transactions.push(newTransaction);
    return this.saveTransactions(transactions);
  }

  // Delete transaction
  deleteTransaction(id) {
    const transactions = this.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    return this.saveTransactions(filtered);
  }

  // Update transaction
  updateTransaction(id, updates) {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      return this.saveTransactions(transactions);
    }
    return false;
  }

  // Get transactions for specific month
  getTransactionsByMonth(year, month) {
    const transactions = this.getTransactions();
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }

  // Get transactions by date range
  getTransactionsByDateRange(startDate, endDate) {
    const transactions = this.getTransactions();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });
  }

  // Export data for backup
  exportData() {
    return {
      transactions: this.getTransactions(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Import data from backup
  importData(data) {
    try {
      if (data.transactions) {
        this.saveTransactions(data.transactions);
      }
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  // Settings management
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        currency: '$',
        dateFormat: 'dd/mm/yyyy',
        theme: 'light'
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  }

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  // Get storage usage info
  getStorageInfo() {
    try {
      const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '';
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS) || '';
      const totalSize = new Blob([transactions + settings]).size;
      
      return {
        totalSize,
        transactionsCount: this.getTransactions().length,
        formattedSize: this.formatBytes(totalSize)
      };
    } catch (error) {
      return { totalSize: 0, transactionsCount: 0, formattedSize: '0 B' };
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new StorageManager();
