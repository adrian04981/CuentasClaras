import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../hooks/useTransactions';
import { useSettings } from '../hooks/useSettings';
import ChartComponent from '../components/OptimizedChart';
import FinancialSummary from '../components/FinancialSummary';

const AnalysisScreen = () => {
  const { transactions, loading, reload } = useTransactions();
  const { settings, formatCurrency } = useSettings();
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    dateRange: 'year', // 'month', 'year', 'custom'
    startDate: '',
    endDate: '',
    category: '',
    type: '', // 'income', 'expense', ''
    minAmount: '',
    maxAmount: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeChart, setActiveChart] = useState('pie');

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Date range filter
    if (filters.dateRange === 'month') {
      const currentMonth = currentDate.getMonth();
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === currentYear && 
               transactionDate.getMonth() === currentMonth;
      });
    } else if (filters.dateRange === 'year') {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === currentYear;
      });
    } else if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(t => 
        t.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Amount range filter
    if (filters.minAmount) {
      filtered = filtered.filter(t => t.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(t => t.amount <= parseFloat(filters.maxAmount));
    }

    return filtered;
  }, [transactions, filters, currentYear, currentDate]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      dateRange: 'year',
      startDate: '',
      endDate: '',
      category: '',
      type: '',
      minAmount: '',
      maxAmount: ''
    });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const getFilterPeriodText = () => {
    switch (filters.dateRange) {
      case 'month':
        return `${currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
      case 'year':
        return `Año ${currentYear}`;
      case 'custom':
        if (filters.startDate && filters.endDate) {
          return `${filters.startDate} - ${filters.endDate}`;
        }
        return 'Período personalizado';
      default:
        return `Año ${currentYear}`;
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.type) count++;
    if (filters.minAmount) count++;
    if (filters.maxAmount) count++;
    if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) count++;
    return count;
  };

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {/* Date Range */}
            <Text style={styles.filterLabel}>Período</Text>
            <View style={styles.dateRangeContainer}>
              {[
                { key: 'month', label: 'Este mes' },
                { key: 'year', label: 'Este año' },
                { key: 'custom', label: 'Personalizado' }
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.dateRangeButton,
                    filters.dateRange === option.key && styles.selectedButton
                  ]}
                  onPress={() => handleFilterChange('dateRange', option.key)}
                >
                  <Text style={[
                    styles.dateRangeText,
                    filters.dateRange === option.key && styles.selectedText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <View style={styles.customDateContainer}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>Desde</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={filters.startDate}
                    onChangeText={(value) => handleFilterChange('startDate', value)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>Hasta</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={filters.endDate}
                    onChangeText={(value) => handleFilterChange('endDate', value)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            )}

            {/* Type Filter */}
            <Text style={styles.filterLabel}>Tipo</Text>
            <View style={styles.typeContainer}>
              {[
                { key: '', label: 'Todos' },
                { key: 'income', label: 'Ingresos' },
                { key: 'expense', label: 'Gastos' }
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.typeButton,
                    filters.type === option.key && styles.selectedButton
                  ]}
                  onPress={() => handleFilterChange('type', option.key)}
                >
                  <Text style={[
                    styles.typeText,
                    filters.type === option.key && styles.selectedText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Filter */}
            <Text style={styles.filterLabel}>Categoría</Text>
            <TextInput
              style={styles.filterInput}
              value={filters.category}
              onChangeText={(value) => handleFilterChange('category', value)}
              placeholder="Buscar por categoría..."
              placeholderTextColor="#999"
            />

            {/* Amount Range */}
            <Text style={styles.filterLabel}>Rango de monto</Text>
            <View style={styles.amountContainer}>
              <TextInput
                style={[styles.filterInput, styles.amountInput]}
                value={filters.minAmount}
                onChangeText={(value) => handleFilterChange('minAmount', value)}
                placeholder="Mínimo"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.filterInput, styles.amountInput]}
                value={filters.maxAmount}
                onChangeText={(value) => handleFilterChange('maxAmount', value)}
                placeholder="Máximo"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with filters */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Análisis Financiero</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons name="filter" size={20} color="#007AFF" />
              {getActiveFiltersCount() > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.period}>{getFilterPeriodText()}</Text>
          <Text style={styles.transactionCount}>
            {filteredTransactions.length} transacciones
          </Text>
        </View>

        {/* Summary */}
        <FinancialSummary 
          transactions={filteredTransactions} 
          period={getFilterPeriodText()}
          formatCurrency={formatCurrency}
        />

        {/* Chart Type Selector */}
        <View style={styles.chartTypeContainer}>
          {[
            { key: 'pie', label: 'Categorías', icon: 'pie-chart' },
            { key: 'bar', label: 'Barras', icon: 'bar-chart' },
            { key: 'line', label: 'Tendencia', icon: 'trending-up' }
          ].map(chart => (
            <TouchableOpacity
              key={chart.key}
              style={[
                styles.chartTypeButton,
                activeChart === chart.key && styles.activeChartButton
              ]}
              onPress={() => setActiveChart(chart.key)}
            >
              <Ionicons 
                name={chart.icon} 
                size={16} 
                color={activeChart === chart.key ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.chartTypeText,
                activeChart === chart.key && styles.activeChartText
              ]}>
                {chart.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Charts */}
        <ChartComponent 
          transactions={filteredTransactions} 
          type={activeChart}
        />
      </ScrollView>

      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  period: {
    fontSize: 18,
    color: '#666',
    marginBottom: 4,
  },
  transactionCount: {
    fontSize: 14,
    color: '#999',
  },
  chartTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeChartButton: {
    backgroundColor: '#007AFF',
  },
  chartTypeText: {
    fontSize: 14,
    color: '#666',
  },
  activeChartText: {
    color: '#fff',
    fontWeight: '600',
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
  filterContent: {
    padding: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dateRangeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  dateRangeText: {
    fontSize: 14,
    color: '#666',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  customDateContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  amountContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  amountInput: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default AnalysisScreen;
