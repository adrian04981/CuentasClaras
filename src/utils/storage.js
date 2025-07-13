import BackupManager from './backupManager';

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

  // Export data for backup (legacy method)
  exportData() {
    return {
      transactions: this.getTransactions(),
      settings: this.getSettings(),
      categories: this.getCategories(),
      accounts: this.getAccounts(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Import data from backup (legacy method)
  importData(data) {
    try {
      if (data.transactions) {
        this.saveTransactions(data.transactions);
      }
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      if (data.categories) {
        this.saveCategories(data.categories);
      }
      if (data.accounts) {
        this.saveAccounts(data.accounts);
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Nuevo método de exportación comprimida
  async exportCompressedBackup(filename) {
    try {
      const data = this.exportData();
      return await BackupManager.downloadBackup(data, filename);
    } catch (error) {
      console.error('Error exporting compressed backup:', error);
      throw error;
    }
  }

  // Nuevo método de importación desde archivo
  async importFromFile() {
    try {
      const data = await BackupManager.loadBackupFromFile();
      const success = this.importData(data);
      if (!success) {
        throw new Error('Error al importar los datos');
      }
      return {
        success: true,
        transactionCount: data.transactions?.length || 0,
        hasSettings: !!data.settings,
        hasCategories: !!data.categories,
        hasAccounts: !!data.accounts
      };
    } catch (error) {
      console.error('Error importing from file:', error);
      throw error;
    }
  }

  // Obtener información de backup
  getBackupInfo(content) {
    return BackupManager.getBackupInfo(content);
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
        currency: 'EUR',
        currencySymbol: '€',
        dateFormat: 'dd/mm/yyyy',
        theme: 'light',
        mode: 'basic', // 'basic', 'semi-professional'
        accounts: [], // For semi-professional mode
        defaultAccount: null,
        categories: {
          expense: [
            'Alimentación', 'Transporte', 'Entretenimiento', 'Salud', 
            'Educación', 'Hogar', 'Ropa', 'Servicios', 'Otros'
          ],
          income: [
            'Salario', 'Freelance', 'Inversiones', 'Ventas', 
            'Bonos', 'Regalos', 'Otros'
          ]
        }
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        currency: 'EUR',
        currencySymbol: '€',
        dateFormat: 'dd/mm/yyyy',
        theme: 'light',
        mode: 'basic',
        accounts: [],
        defaultAccount: null,
        categories: {
          expense: [
            'Alimentación', 'Transporte', 'Entretenimiento', 'Salud', 
            'Educación', 'Hogar', 'Ropa', 'Servicios', 'Otros'
          ],
          income: [
            'Salario', 'Freelance', 'Inversiones', 'Ventas', 
            'Bonos', 'Regalos', 'Otros'
          ]
        }
      };
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

  // Save accounts
  saveAccounts(accounts) {
    try {
      const settings = this.getSettings();
      settings.accounts = accounts;
      return this.saveSettings(settings);
    } catch (error) {
      console.error('Error saving accounts:', error);
      return false;
    }
  }

  // Save categories
  saveCategories(categories) {
    try {
      const settings = this.getSettings();
      settings.categories = categories;
      return this.saveSettings(settings);
    } catch (error) {
      console.error('Error saving categories:', error);
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

  // Account management for semi-professional mode
  getAccounts() {
    const settings = this.getSettings();
    return settings.accounts || [];
  }

  addAccount(account) {
    try {
      const settings = this.getSettings();
      const newAccount = {
        id: Date.now().toString(),
        ...account,
        createdAt: new Date().toISOString()
      };
      settings.accounts = [...(settings.accounts || []), newAccount];
      
      // Set as default if it's the first account
      if (settings.accounts.length === 1) {
        settings.defaultAccount = newAccount.id;
      }
      
      return this.saveSettings(settings) ? newAccount : null;
    } catch (error) {
      console.error('Error adding account:', error);
      return null;
    }
  }

  updateAccount(id, updates) {
    try {
      const settings = this.getSettings();
      const accountIndex = settings.accounts.findIndex(a => a.id === id);
      if (accountIndex !== -1) {
        settings.accounts[accountIndex] = { ...settings.accounts[accountIndex], ...updates };
        return this.saveSettings(settings);
      }
      return false;
    } catch (error) {
      console.error('Error updating account:', error);
      return false;
    }
  }

  deleteAccount(id) {
    try {
      const settings = this.getSettings();
      settings.accounts = settings.accounts.filter(a => a.id !== id);
      
      // Reset default account if deleted
      if (settings.defaultAccount === id) {
        settings.defaultAccount = settings.accounts.length > 0 ? settings.accounts[0].id : null;
      }
      
      return this.saveSettings(settings);
    } catch (error) {
      console.error('Error deleting account:', error);
      return false;
    }
  }

  setDefaultAccount(id) {
    try {
      const settings = this.getSettings();
      settings.defaultAccount = id;
      return this.saveSettings(settings);
    } catch (error) {
      console.error('Error setting default account:', error);
      return false;
    }
  }

  // Get account balance based on transactions
  getAccountBalance(accountId) {
    const transactions = this.getTransactions().filter(t => t.accountId === accountId);
    return transactions.reduce((balance, transaction) => {
      return transaction.type === 'income' 
        ? balance + transaction.amount 
        : balance - transaction.amount;
    }, 0);
  }

  // Category management
  getCategories(type = null) {
    const settings = this.getSettings();
    if (type) {
      return settings.categories[type] || [];
    }
    return settings.categories || {
      expense: [],
      income: []
    };
  }

  addCategory(type, categoryName) {
    try {
      const settings = this.getSettings();
      if (!settings.categories[type]) {
        settings.categories[type] = [];
      }
      
      // Check if category already exists
      if (settings.categories[type].includes(categoryName)) {
        return false;
      }
      
      settings.categories[type].push(categoryName);
      return this.saveSettings(settings);
    } catch (error) {
      console.error('Error adding category:', error);
      return false;
    }
  }

  deleteCategory(type, categoryName) {
    try {
      const settings = this.getSettings();
      if (!settings.categories[type]) {
        return false;
      }
      
      settings.categories[type] = settings.categories[type].filter(cat => cat !== categoryName);
      return this.saveSettings(settings);
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  updateCategory(type, oldName, newName) {
    try {
      const settings = this.getSettings();
      if (!settings.categories[type]) {
        return false;
      }
      
      const index = settings.categories[type].indexOf(oldName);
      if (index !== -1) {
        settings.categories[type][index] = newName;
        
        // Update existing transactions with the new category name
        const transactions = this.getTransactions();
        const updatedTransactions = transactions.map(t => 
          t.type === type && t.category === oldName 
            ? { ...t, category: newName }
            : t
        );
        
        this.saveTransactions(updatedTransactions);
        return this.saveSettings(settings);
      }
      return false;
    } catch (error) {
      console.error('Error updating category:', error);
      return false;
    }
  }
}

export default new StorageManager();
