import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StorageManager from '../utils/storage';

const PartyCard = ({ party, onPress, onDelete }) => {
  const summary = StorageManager.getPartySummary(party.id);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = () => {
    switch (party.status) {
      case 'active':
        return '#34C759';
      case 'settled':
        return '#007AFF';
      default:
        return '#666';
    }
  };

  const getStatusText = () => {
    switch (party.status) {
      case 'active':
        return 'Activa';
      case 'settled':
        return 'Liquidada';
      default:
        return 'Desconocido';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{party.name}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {party.description && (
        <Text style={styles.description} numberOfLines={2}>
          {party.description}
        </Text>
      )}

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{party.date}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {summary?.participantCount || 0} participantes
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total gastado</Text>
          <Text style={styles.statValue}>
            {formatCurrency(summary?.totalExpenses || 0)}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Gastos</Text>
          <Text style={styles.statValue}>
            {summary?.expenseCount || 0}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Pendientes</Text>
          <Text style={[styles.statValue, styles.pendingValue]}>
            {summary?.settlements?.length || 0}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Toca para ver detalles</Text>
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    marginTop: -4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pendingValue: {
    color: '#FF9500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});

export default PartyCard;
