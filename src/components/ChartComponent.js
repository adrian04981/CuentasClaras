import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 40;

const ChartComponent = ({ transactions, type = 'category' }) => {
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#007AFF',
    },
  };

  // Generate random colors for pie chart
  const generateColors = (count) => {
    const colors = [
      '#007AFF', '#FF3B30', '#34C759', '#FF9500', '#AF52DE',
      '#FF2D92', '#5AC8FA', '#FFCC00', '#FF6B6B', '#4ECDC4'
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

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

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8); // Top 8 categories

    return sortedCategories.map(([category, amount], index) => ({
      name: category.length > 10 ? category.substring(0, 10) + '...' : category,
      amount: amount,
      color: generateColors(sortedCategories.length)[index],
      legendFontColor: '#333',
      legendFontSize: 12
    }));
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

    const sortedMonths = Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Last 6 months

    const labels = sortedMonths.map(([month]) => {
      const [year, monthNum] = month.split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                         'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return monthNames[parseInt(monthNum) - 1];
    });

    const incomeData = sortedMonths.map(([, data]) => data.income);
    const expenseData = sortedMonths.map(([, data]) => data.expense);

    return {
      labels,
      datasets: [
        {
          data: incomeData,
          color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
          strokeWidth: 2
        },
        {
          data: expenseData,
          color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ['Ingresos', 'Gastos']
    };
  };

  const renderPieChart = () => {
    const data = getCategoryData();
    
    if (data.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>No hay datos de gastos por categoría</Text>
        </View>
      );
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Gastos por Categoría</Text>
        <PieChart
          data={data}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
        <ScrollView style={styles.legend} horizontal showsHorizontalScrollIndicator={false}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.name}</Text>
              <Text style={styles.legendAmount}>{formatAmount(item.amount)}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderLineChart = () => {
    const data = getMonthlyData();
    
    if (data.labels.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>No hay datos históricos suficientes</Text>
        </View>
      );
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tendencia Mensual</Text>
        <LineChart
          data={data}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          yAxisSuffix="€"
          yAxisInterval={1}
          formatYLabel={(value) => `${Math.round(value)}€`}
        />
      </View>
    );
  };

  const renderBarChart = () => {
    const categoryData = getCategoryData();
    
    if (categoryData.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>No hay datos para mostrar</Text>
        </View>
      );
    }

    const data = {
      labels: categoryData.map(item => item.name),
      datasets: [{
        data: categoryData.map(item => item.amount)
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Top Categorías de Gastos</Text>
        <BarChart
          data={data}
          width={chartWidth}
          height={220}
          chartConfig={{
            ...chartConfig,
            barPercentage: 0.7,
          }}
          style={styles.chart}
          yAxisSuffix="€"
          formatYLabel={(value) => `${Math.round(value)}€`}
          showValuesOnTopOfBars={true}
        />
      </View>
    );
  };

  switch (type) {
    case 'pie':
      return renderPieChart();
    case 'line':
      return renderLineChart();
    case 'bar':
      return renderBarChart();
    default:
      return renderPieChart();
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
  chart: {
    borderRadius: 16,
  },
  legend: {
    marginTop: 16,
    maxHeight: 100,
  },
  legendItem: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 80,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  legendAmount: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
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
});

export default ChartComponent;
