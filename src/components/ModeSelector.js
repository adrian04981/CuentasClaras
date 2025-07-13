import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MODES = [
  {
    key: 'basic',
    title: 'Modo Básico',
    subtitle: 'Solo ingresos y gastos',
    description: 'Perfecto para un control simple de tus finanzas personales. Registra tus ingresos y gastos de forma sencilla.',
    icon: 'calculator',
    color: '#34C759',
    features: [
      'Registro de ingresos y gastos',
      'Categorización simple',
      'Resúmenes mensuales',
      'Gráficos básicos'
    ]
  },
  {
    key: 'semi-professional',
    title: 'Modo Semi-Profesional',
    subtitle: 'Gestión completa con cuentas',
    description: 'Controla múltiples cuentas bancarias, tarjetas y efectivo. Ideal para una gestión financiera más detallada.',
    icon: 'card',
    color: '#007AFF',
    features: [
      'Múltiples cuentas bancarias',
      'Tarjetas de crédito y débito',
      'Control de efectivo',
      'Balances por cuenta',
      'Transferencias entre cuentas',
      'Análisis avanzado'
    ]
  }
];

const ModeSelector = ({ selectedMode, onModeSelect }) => {
  const handleModeSelect = (mode) => {
    onModeSelect(mode.key);
  };

  const ModeCard = ({ mode, isSelected }) => (
    <TouchableOpacity 
      style={[
        styles.modeCard, 
        isSelected && styles.selectedCard,
        { borderColor: isSelected ? mode.color : '#eee' }
      ]}
      onPress={() => handleModeSelect(mode)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: mode.color }]}>
          <Ionicons name={mode.icon} size={24} color="#fff" />
        </View>
        <View style={styles.modeInfo}>
          <Text style={styles.modeTitle}>{mode.title}</Text>
          <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={mode.color} />
          </View>
        )}
      </View>
      
      <Text style={styles.modeDescription}>{mode.description}</Text>
      
      <View style={styles.featuresList}>
        <Text style={styles.featuresTitle}>Características:</Text>
        {mode.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark" size={16} color={mode.color} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      {isSelected && (
        <View style={[styles.selectedBadge, { backgroundColor: mode.color }]}>
          <Text style={styles.selectedBadgeText}>Modo Actual</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Seleccionar Modo de Uso</Text>
      <Text style={styles.subtitle}>
        Elige el modo que mejor se adapte a tus necesidades financieras
      </Text>
      
      {MODES.map(mode => (
        <ModeCard 
          key={mode.key} 
          mode={mode} 
          isSelected={selectedMode === mode.key}
        />
      ))}
      
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#007AFF" />
        <Text style={styles.infoText}>
          Puedes cambiar de modo en cualquier momento desde la configuración. 
          Tus datos se mantendrán seguros.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    shadowColor: '#007AFF',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  modeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  modeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresList: {
    marginBottom: 12,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  selectedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e6f3ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default ModeSelector;
