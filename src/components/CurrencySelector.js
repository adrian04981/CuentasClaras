import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CURRENCIES = [
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Yen Japonés', symbol: '¥', flag: '🇯🇵' },
  { code: 'CHF', name: 'Franco Suizo', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CAD', name: 'Dólar Canadiense', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CNY', name: 'Yuan Chino', symbol: '¥', flag: '🇨🇳' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽' },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$', flag: '🇧🇷' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', flag: '🇨🇱' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$', flag: '🇨🇴' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', flag: '🇵🇪' },
  { code: 'UYU', name: 'Peso Uruguayo', symbol: '$U', flag: '🇺🇾' },
  { code: 'VES', name: 'Bolívar Venezolano', symbol: 'Bs.', flag: '🇻🇪' },
];

const CurrencySelector = ({ selectedCurrency, onCurrencySelect }) => {
  const [searchText, setSearchText] = useState('');

  const filteredCurrencies = CURRENCIES.filter(currency =>
    currency.name.toLowerCase().includes(searchText.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCurrencyPress = (currency) => {
    onCurrencySelect(currency.code, currency.symbol);
  };

  const CurrencyItem = ({ currency, isSelected }) => (
    <TouchableOpacity
      style={[styles.currencyItem, isSelected && styles.selectedItem]}
      onPress={() => handleCurrencyPress(currency)}
    >
      <View style={styles.currencyInfo}>
        <Text style={styles.flag}>{currency.flag}</Text>
        <View style={styles.currencyDetails}>
          <Text style={[styles.currencyCode, isSelected && styles.selectedText]}>
            {currency.code}
          </Text>
          <Text style={[styles.currencyName, isSelected && styles.selectedSubtext]}>
            {currency.name}
          </Text>
        </View>
        <Text style={[styles.currencySymbol, isSelected && styles.selectedText]}>
          {currency.symbol}
        </Text>
      </View>
      {isSelected && (
        <View style={styles.checkmark}>
          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar moneda..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Currency List */}
      <ScrollView style={styles.currencyList} showsVerticalScrollIndicator={false}>
        {filteredCurrencies.map((currency) => (
          <CurrencyItem
            key={currency.code}
            currency={currency}
            isSelected={selectedCurrency === currency.code}
          />
        ))}
        
        {filteredCurrencies.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No se encontraron monedas</Text>
            <Text style={styles.emptyStateSubtext}>
              Intenta con otro término de búsqueda
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  currencyList: {
    flex: 1,
  },
  currencyItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedItem: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 14,
    color: '#666',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  selectedText: {
    color: '#007AFF',
  },
  selectedSubtext: {
    color: '#0056b3',
  },
  checkmark: {
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default CurrencySelector;
