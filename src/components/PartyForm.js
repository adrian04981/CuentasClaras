import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PartyForm = ({ party = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: party?.name || '',
    description: party?.description || '',
    date: party?.date || new Date().toISOString().split('T')[0],
    participants: party?.participants || []
  });
  
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [participantName, setParticipantName] = useState('');

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre de la fiesta es obligatorio');
      return;
    }

    if (formData.participants.length === 0) {
      Alert.alert('Error', 'Debe agregar al menos un participante');
      return;
    }

    onSubmit(formData);
  };

  const addParticipant = () => {
    if (!participantName.trim()) {
      Alert.alert('Error', 'El nombre del participante es obligatorio');
      return;
    }

    const newParticipant = {
      id: Date.now().toString(),
      name: participantName.trim()
    };

    setFormData(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }));
    
    setParticipantName('');
    setShowParticipantModal(false);
  };

  const removeParticipant = (participantId) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== participantId)
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {party ? 'Editar Fiesta' : 'Nueva Fiesta'}
        </Text>
        <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
          <Text style={styles.saveText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form}>
        {/* Party Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de la fiesta *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
            placeholder="Ej: Cumpleaños de Juan"
            placeholderTextColor="#999"
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
            placeholder="Descripción opcional..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fecha</Text>
          <TextInput
            style={styles.input}
            value={formData.date}
            onChangeText={(value) => setFormData(prev => ({ ...prev, date: value }))}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
          />
        </View>

        {/* Participants */}
        <View style={styles.inputGroup}>
          <View style={styles.participantsHeader}>
            <Text style={styles.label}>Participantes ({formData.participants.length})</Text>
            <TouchableOpacity
              style={styles.addParticipantButton}
              onPress={() => setShowParticipantModal(true)}
            >
              <Ionicons name="add" size={20} color="#007AFF" />
              <Text style={styles.addParticipantText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {formData.participants.length === 0 ? (
            <View style={styles.noParticipants}>
              <Text style={styles.noParticipantsText}>
                No hay participantes agregados
              </Text>
            </View>
          ) : (
            formData.participants.map((participant) => (
              <View key={participant.id} style={styles.participantItem}>
                <View style={styles.participantInfo}>
                  <Ionicons name="person" size={20} color="#666" />
                  <Text style={styles.participantName}>{participant.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeParticipant(participant.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Participant Modal */}
      <Modal
        visible={showParticipantModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Participante</Text>
            
            <TextInput
              style={styles.modalInput}
              value={participantName}
              onChangeText={setParticipantName}
              placeholder="Nombre del participante"
              placeholderTextColor="#999"
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => {
                  setParticipantName('');
                  setShowParticipantModal(false);
                }}
              >
                <Text style={styles.cancelModalText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.addModalButton]}
                onPress={addParticipant}
              >
                <Text style={styles.addModalText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addParticipantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addParticipantText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 4,
  },
  noParticipants: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  noParticipantsText: {
    color: '#666',
    fontSize: 14,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  removeButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelModalText: {
    color: '#666',
    fontSize: 16,
  },
  addModalButton: {
    backgroundColor: '#007AFF',
  },
  addModalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PartyForm;
