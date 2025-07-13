import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StorageManager from '../utils/storage';
import PartyForm from '../components/PartyForm';
import PartyCard from '../components/PartyCard';

const PartyScreen = ({ navigation }) => {
  const [parties, setParties] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = async () => {
    try {
      const partiesData = StorageManager.getParties();
      setParties(partiesData);
    } catch (error) {
      console.error('Error loading parties:', error);
      Alert.alert('Error', 'No se pudieron cargar las fiestas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParty = async (partyData) => {
    try {
      const newParty = StorageManager.createParty(partyData);
      if (newParty) {
        setParties(prev => [...prev, newParty]);
        setShowCreateModal(false);
        Alert.alert('Éxito', 'Fiesta creada correctamente');
      } else {
        Alert.alert('Error', 'No se pudo crear la fiesta');
      }
    } catch (error) {
      console.error('Error creating party:', error);
      Alert.alert('Error', 'No se pudo crear la fiesta');
    }
  };

  const handleDeleteParty = (partyId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar esta fiesta? Se perderán todos los gastos asociados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            if (StorageManager.deleteParty(partyId)) {
              setParties(prev => prev.filter(p => p.id !== partyId));
              Alert.alert('Éxito', 'Fiesta eliminada');
            } else {
              Alert.alert('Error', 'No se pudo eliminar la fiesta');
            }
          }
        }
      ]
    );
  };

  const handlePartyPress = (party) => {
    navigation.navigate('PartyDetail', { partyId: party.id });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Cargando fiestas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="people" size={28} color="#007AFF" />
          <Text style={styles.headerTitle}>Fiestas</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Parties List */}
      <ScrollView style={styles.content}>
        {parties.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No hay fiestas</Text>
            <Text style={styles.emptySubtitle}>
              Crea tu primera fiesta para gestionar gastos compartidos
            </Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.createFirstButtonText}>Crear primera fiesta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          parties.map((party) => (
            <PartyCard
              key={party.id}
              party={party}
              onPress={() => handlePartyPress(party)}
              onDelete={() => handleDeleteParty(party.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Create Party Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <PartyForm
          onSubmit={handleCreateParty}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 40,
  },
  createFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  createFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PartyScreen;
