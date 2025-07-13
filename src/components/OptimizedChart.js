import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Simple SVG-based charts for web optimization
const SimpleChart = ({ transactions, type = 'category' }) => {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const getCategoryData = () => {
    const categoryTotals = {};
    
    transactions.forEach(transaction => {
      const { category, amount, type } = transaction;
      if (type === 'expense') {
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      }
    });

    return Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6);
  };

  const getMonthlyData = () => {
    const monthlyTotals = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyTotals[monthKey].income += transaction.amount;
      } else {
        monthlyTotals[monthKey].expense += transaction.amount;
      }
    });

    return Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
  };

  const SimplePieChart = () => {
    const data = getCategoryData();
    
    if (data.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>No hay datos de gastos por categoría</Text>
        </View>
      );
    }

    const total = data.reduce((sum, [, amount]) => sum + amount, 0);
    const colors = ['#007AFF', '#FF3B30', '#34C759', '#FF9500', '#AF52DE', '#FF2D92'];

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Gastos por Categoría</Text>
        <View style={styles.pieContainer}>
          {data.map(([category, amount], index) => {
            const percentage = ((amount / total) * 100).toFixed(1);
            return (
              <View key={category} style={styles.pieItem}>
                <View style={[styles.pieColor, { backgroundColor: colors[index] }]} />
                <View style={styles.pieText}>
                  <Text style={styles.pieCategoryText}>
                    {category.length > 15 ? category.substring(0, 15) + '...' : category}
                  </Text>
                  <Text style={styles.pieAmountText}>
                    {formatAmount(amount)} ({percentage}%)
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const SimpleBarChart = () => {
    const data = getCategoryData();
    
    if (data.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>No hay datos para mostrar</Text>
        </View>
      );
    }

    const maxAmount = Math.max(...data.map(([, amount]) => amount));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Top Categorías de Gastos</Text>
        <View style={styles.barContainer}>
          {data.map(([category, amount], index) => {
            const percentage = (amount / maxAmount) * 100;
            const colors = ['#007AFF', '#FF3B30', '#34C759', '#FF9500', '#AF52DE', '#FF2D92'];
            
            return (
              <View key={category} style={styles.barItem}>
                <Text style={styles.barCategory}>
                  {category.length > 10 ? category.substring(0, 10) + '...' : category}
                </Text>
                <View style={styles.barTrack}>
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        width: `${percentage}%`,
                        backgroundColor: colors[index]
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.barAmount}>{formatAmount(amount)}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const SimpleLineChart = () => {
    const data = getMonthlyData();
    
    if (data.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>No hay datos históricos suficientes</Text>
        </View>
      );
    }

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tendencia Mensual</Text>
        <View style={styles.lineContainer}>
          {data.map(([month, values], index) => {
            const [year, monthNum] = month.split('-');
            const monthName = monthNames[parseInt(monthNum) - 1];
            
            return (
              <View key={month} style={styles.lineItem}>
                <Text style={styles.lineMonth}>{monthName}</Text>
                <View style={styles.lineValues}>
                  <Text style={[styles.lineValue, { color: '#34C759' }]}>
                    +{formatAmount(values.income)}
                  </Text>
                  <Text style={[styles.lineValue, { color: '#FF3B30' }]}>
                    -{formatAmount(values.expense)}
                  </Text>
                  <Text style={styles.lineBalance}>
                    {values.income - values.expense >= 0 ? '+' : ''}
                    {formatAmount(values.income - values.expense)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  switch (type) {
    case 'pie':
      return <SimplePieChart />;
    case 'bar':
      return <SimpleBarChart />;
    case 'line':
      return <SimpleLineChart />;
    default:
      return <SimplePieChart />;
  }
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyChart: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  pieContainer: {
    gap: 12,
  },
  pieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pieColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pieText: {
    flex: 1,
  },
  pieCategoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  pieAmountText: {
    fontSize: 12,
    color: '#666',
  },
  barContainer: {
    gap: 16,
  },
  barItem: {
    gap: 8,
  },
  barCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  barTrack: {
    height: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 12,
  },
  barAmount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  lineContainer: {
    gap: 16,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lineMonth: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    minWidth: 40,
  },
  lineValues: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  lineValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  lineBalance: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

// Use lightweight charts for web, full charts for mobile
export default Platform.OS === 'web' ? SimpleChart : require('./ChartComponent').default;
