import BackupManager from './backupManager';

// Optimized storage utility for web localStorage
const STORAGE_KEYS = {
  TRANSACTIONS: 'cc_transactions',
  SETTINGS: 'cc_settings',
  PARTIES: 'cc_parties',
  PARTY_EXPENSES: 'cc_party_expenses'
};

class StorageManager {
  // Get all transactions
  getTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      let transactions = data ? JSON.parse(data) : [];
      
      // Migration: Ensure all transactions have accountId field
      let needsMigration = false;
      transactions = transactions.map(transaction => {
        if (!transaction.hasOwnProperty('accountId')) {
          needsMigration = true;
          return { ...transaction, accountId: null };
        }
        return transaction;
      });
      
      // Save migrated transactions if needed
      if (needsMigration) {
        this.saveTransactions(transactions);
      }
      
      return transactions;
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
    const account = this.getAccounts().find(a => a.id === accountId);
    if (!account) return 0;
    
    const initialBalance = account.initialBalance || 0;
    const transactions = this.getTransactions().filter(t => t.accountId === accountId);
    
    const transactionBalance = transactions.reduce((balance, transaction) => {
      return transaction.type === 'income' 
        ? balance + transaction.amount 
        : balance - transaction.amount;
    }, 0);
    
    return initialBalance + transactionBalance;
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

  // ===========================================
  // PARTY MANAGEMENT FUNCTIONS
  // ===========================================

  // Get all parties
  getParties() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PARTIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading parties:', error);
      return [];
    }
  }

  // Save parties
  saveParties(parties) {
    try {
      localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
      return true;
    } catch (error) {
      console.error('Error saving parties:', error);
      return false;
    }
  }

  // Create new party
  createParty(partyData) {
    try {
      const parties = this.getParties();
      const newParty = {
        id: Date.now().toString(),
        name: partyData.name,
        description: partyData.description || '',
        date: partyData.date,
        participants: partyData.participants || [],
        status: 'active', // active, settled
        createdAt: new Date().toISOString(),
        ...partyData
      };
      
      parties.push(newParty);
      return this.saveParties(parties) ? newParty : null;
    } catch (error) {
      console.error('Error creating party:', error);
      return null;
    }
  }

  // Update party
  updateParty(partyId, updates) {
    try {
      const parties = this.getParties();
      const partyIndex = parties.findIndex(p => p.id === partyId);
      
      if (partyIndex >= 0) {
        parties[partyIndex] = { ...parties[partyIndex], ...updates };
        return this.saveParties(parties);
      }
      return false;
    } catch (error) {
      console.error('Error updating party:', error);
      return false;
    }
  }

  // Delete party
  deleteParty(partyId) {
    try {
      const parties = this.getParties().filter(p => p.id !== partyId);
      // Also delete all expenses related to this party
      const expenses = this.getPartyExpenses().filter(e => e.partyId !== partyId);
      this.savePartyExpenses(expenses);
      return this.saveParties(parties);
    } catch (error) {
      console.error('Error deleting party:', error);
      return false;
    }
  }

  // Get party expenses
  getPartyExpenses(partyId = null) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PARTY_EXPENSES);
      const expenses = data ? JSON.parse(data) : [];
      return partyId ? expenses.filter(e => e.partyId === partyId) : expenses;
    } catch (error) {
      console.error('Error loading party expenses:', error);
      return [];
    }
  }

  // Save party expenses
  savePartyExpenses(expenses) {
    try {
      localStorage.setItem(STORAGE_KEYS.PARTY_EXPENSES, JSON.stringify(expenses));
      return true;
    } catch (error) {
      console.error('Error saving party expenses:', error);
      return false;
    }
  }

  // Add party expense
  addPartyExpense(expenseData) {
    try {
      const expenses = this.getPartyExpenses();
      const newExpense = {
        id: Date.now().toString(),
        partyId: expenseData.partyId,
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        paidBy: expenseData.paidBy, // participant ID who paid
        splitType: expenseData.splitType, // 'equal', 'custom', 'percentage', 'immediate'
        splitData: expenseData.splitData || {}, // { participantId: amount/percentage }
        category: expenseData.category || 'Otros',
        date: expenseData.date || new Date().toISOString().split('T')[0],
        isPaidImmediately: expenseData.isPaidImmediately || false,
        createdAt: new Date().toISOString()
      };
      
      expenses.push(newExpense);
      return this.savePartyExpenses(expenses) ? newExpense : null;
    } catch (error) {
      console.error('Error adding party expense:', error);
      return null;
    }
  }

  // Update party expense
  updatePartyExpense(expenseId, updates) {
    try {
      const expenses = this.getPartyExpenses();
      const expenseIndex = expenses.findIndex(e => e.id === expenseId);
      
      if (expenseIndex >= 0) {
        expenses[expenseIndex] = { ...expenses[expenseIndex], ...updates };
        return this.savePartyExpenses(expenses);
      }
      return false;
    } catch (error) {
      console.error('Error updating party expense:', error);
      return false;
    }
  }

  // Delete party expense
  deletePartyExpense(expenseId) {
    try {
      const expenses = this.getPartyExpenses().filter(e => e.id !== expenseId);
      return this.savePartyExpenses(expenses);
    } catch (error) {
      console.error('Error deleting party expense:', error);
      return false;
    }
  }

  // Calculate party settlements (who owes whom)
  calculatePartySettlements(partyId) {
    try {
      const party = this.getParties().find(p => p.id === partyId);
      const expenses = this.getPartyExpenses(partyId);
      
      if (!party || !expenses.length) return { balances: {}, settlements: [] };

      // Initialize balances for all participants
      const balances = {};
      party.participants.forEach(participant => {
        balances[participant.id] = 0;
      });

      // Calculate what each person owes/is owed
      expenses.forEach(expense => {
        // Skip immediate payments - they don't create debts
        if (expense.isPaidImmediately) {
          return;
        }

        const paidBy = expense.paidBy;
        const amount = expense.amount;

        // Add amount paid to payer's balance
        balances[paidBy] = (balances[paidBy] || 0) + amount;

        // Subtract what each person owes based on split
        if (expense.splitType === 'equal') {
          const splitAmount = amount / party.participants.length;
          party.participants.forEach(participant => {
            balances[participant.id] = (balances[participant.id] || 0) - splitAmount;
          });
        } else if (expense.splitType === 'custom') {
          Object.entries(expense.splitData).forEach(([participantId, owedAmount]) => {
            balances[participantId] = (balances[participantId] || 0) - owedAmount;
          });
        }
      });

      // Calculate settlements (simplified debt resolution)
      const settlements = this.simplifyDebts(balances);

      return { balances, settlements };
    } catch (error) {
      console.error('Error calculating settlements:', error);
      return { balances: {}, settlements: [] };
    }
  }

  // Simplify debts to minimize number of transactions
  simplifyDebts(balances) {
    const creditors = []; // People who are owed money
    const debtors = [];   // People who owe money

    Object.entries(balances).forEach(([personId, balance]) => {
      if (balance > 0.01) {
        creditors.push({ id: personId, amount: balance });
      } else if (balance < -0.01) {
        debtors.push({ id: personId, amount: Math.abs(balance) });
      }
    });

    const settlements = [];

    while (creditors.length > 0 && debtors.length > 0) {
      const creditor = creditors[0];
      const debtor = debtors[0];

      const settlementAmount = Math.min(creditor.amount, debtor.amount);

      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(settlementAmount * 100) / 100
      });

      creditor.amount -= settlementAmount;
      debtor.amount -= settlementAmount;

      if (creditor.amount < 0.01) creditors.shift();
      if (debtor.amount < 0.01) debtors.shift();
    }

    return settlements;
  }

  // Get party summary
  getPartySummary(partyId) {
    try {
      const party = this.getParties().find(p => p.id === partyId);
      const expenses = this.getPartyExpenses(partyId);
      
      if (!party) return null;

      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const { balances, settlements } = this.calculatePartySettlements(partyId);

      return {
        party,
        totalExpenses: totalAmount,
        expenseCount: expenses.length,
        participantCount: party.participants.length,
        balances,
        settlements,
        expenses
      };
    } catch (error) {
      console.error('Error getting party summary:', error);
      return null;
    }
  }
}

export default new StorageManager();
