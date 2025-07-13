import { useState, useEffect, useCallback } from 'react';
import StorageManager from '../utils/storage';

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(() => {
    setLoading(true);
    try {
      const data = StorageManager.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback((updates) => {
    const newSettings = { ...settings, ...updates };
    const success = StorageManager.saveSettings(newSettings);
    if (success) {
      setSettings(newSettings);
    }
    return success;
  }, [settings]);

  const resetSettings = useCallback(() => {
    const defaultSettings = {
      currency: 'EUR',
      currencySymbol: '€',
      dateFormat: 'dd/mm/yyyy',
      theme: 'light',
      mode: 'basic',
      accounts: [],
      defaultAccount: null
    };
    const success = StorageManager.saveSettings(defaultSettings);
    if (success) {
      setSettings(defaultSettings);
    }
    return success;
  }, []);

  // Account management
  const addAccount = useCallback((account) => {
    const newAccount = StorageManager.addAccount(account);
    if (newAccount) {
      loadSettings(); // Reload to get updated accounts
    }
    return newAccount;
  }, [loadSettings]);

  const updateAccount = useCallback((id, updates) => {
    const success = StorageManager.updateAccount(id, updates);
    if (success) {
      loadSettings();
    }
    return success;
  }, [loadSettings]);

  const deleteAccount = useCallback((id) => {
    const success = StorageManager.deleteAccount(id);
    if (success) {
      loadSettings();
    }
    return success;
  }, [loadSettings]);

  const setDefaultAccount = useCallback((id) => {
    const success = StorageManager.setDefaultAccount(id);
    if (success) {
      loadSettings();
    }
    return success;
  }, [loadSettings]);

  const getAccountBalance = useCallback((accountId) => {
    return StorageManager.getAccountBalance(accountId);
  }, []);

  // Category management
  const addCategory = useCallback((type, categoryName) => {
    const success = StorageManager.addCategory(type, categoryName);
    if (success) {
      loadSettings();
    }
    return success;
  }, [loadSettings]);

  const updateCategory = useCallback((type, oldName, newName) => {
    const success = StorageManager.updateCategory(type, oldName, newName);
    if (success) {
      loadSettings();
    }
    return success;
  }, [loadSettings]);

  const deleteCategory = useCallback((type, categoryName) => {
    const success = StorageManager.deleteCategory(type, categoryName);
    if (success) {
      loadSettings();
    }
    return success;
  }, [loadSettings]);

  const getCategories = useCallback((type = null) => {
    return StorageManager.getCategories(type);
  }, []);

  // Currency formatting
  const formatCurrency = useCallback((amount) => {
    if (!settings) return amount.toString();
    
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }, [settings]);

  return {
    settings,
    loading,
    updateSettings,
    resetSettings,
    formatCurrency,
    // Account management
    addAccount,
    updateAccount,
    deleteAccount,
    setDefaultAccount,
    getAccountBalance,
    // Category management
    addCategory,
    updateCategory,
    deleteCategory,
    getCategories,
    reload: loadSettings
  };
};
