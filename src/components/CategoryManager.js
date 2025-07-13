import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CategoryManager = ({ 
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory 
}) => {
  const [activeTab, setActiveTab] = useState('expense');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la categoría');
      return;
    }

    const success = onAddCategory(activeTab, newCategoryName.trim());
    if (success) {
      Alert.alert('Éxito', 'Categoría agregada correctamente');
      setNewCategoryName('');
      setShowAddModal(false);
    } else {
      Alert.alert('Error', 'No se pudo agregar la categoría. Puede que ya exista.');
    }
  };

  const handleEditCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la categoría');
      return;
    }

    const success = onUpdateCategory(activeTab, editingCategory, newCategoryName.trim());
    if (success) {
      Alert.alert('Éxito', 'Categoría actualizada correctamente');
      setNewCategoryName('');
      setEditingCategory(null);
      setShowEditModal(false);
    } else {
      Alert.alert('Error', 'No se pudo actualizar la categoría');
    }
  };

  const handleDeleteCategory = (categoryName) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar la categoría "${categoryName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const success = onDeleteCategory(activeTab, categoryName);
            if (success) {
              Alert.alert('Éxito', 'Categoría eliminada correctamente');
            } else {
              Alert.alert('Error', 'No se pudo eliminar la categoría');
            }
          }
        }
      ]
    );
  };

  const startEditCategory = (categoryName) => {
    setEditingCategory(categoryName);
    setNewCategoryName(categoryName);
    setShowEditModal(true);
  };

  const CategoryItem = ({ category, canDelete = true }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <View style={[
          styles.categoryIcon, 
          { backgroundColor: activeTab === 'income' ? '#34C759' : '#FF3B30' }
        ]}>
          <Ionicons 
            name={activeTab === 'income' ? 'trending-up' : 'trending-down'} 
            size={16} 
            color="#fff" 
          />
        </View>
        <Text style={styles.categoryName}>{category}</Text>
      </View>
      
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => startEditCategory(category)}
        >
          <Ionicons name="pencil" size={16} color="#007AFF" />
        </TouchableOpacity>
        
        {canDelete && category !== 'Otros' && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteCategory(category)}
          >
            <Ionicons name="trash" size={16} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const AddModal = () => (
    <Modal
      visible={showAddModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Agregar {activeTab === 'income' ? 'Tipo de Ingreso' : 'Tipo de Gasto'}
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>Nombre de la categoría:</Text>
            <TextInput
              style={styles.textInput}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Ej: Supermercado, Gimnasio, etc."
              placeholderTextColor="#999"
              autoFocus
            />
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => {
                setShowAddModal(false);
                setNewCategoryName('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, !newCategoryName.trim() && styles.disabledButton]} 
              onPress={handleAddCategory}
              disabled={!newCategoryName.trim()}
            >
              <Text style={styles.saveButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const EditModal = () => (
    <Modal
      visible={showEditModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Categoría</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>Nombre de la categoría:</Text>
            <TextInput
              style={styles.textInput}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Nombre de la categoría"
              placeholderTextColor="#999"
              autoFocus
            />
            
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                Al cambiar el nombre, se actualizarán todas las transacciones existentes.
              </Text>
            </View>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => {
                setShowEditModal(false);
                setNewCategoryName('');
                setEditingCategory(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, !newCategoryName.trim() && styles.disabledButton]} 
              onPress={handleEditCategory}
              disabled={!newCategoryName.trim()}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expense' && styles.activeTab]}
          onPress={() => setActiveTab('expense')}
        >
          <Ionicons name="trending-down" size={20} color={activeTab === 'expense' ? '#fff' : '#FF3B30'} />
          <Text style={[styles.tabText, activeTab === 'expense' && styles.activeTabText]}>
            Gastos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'income' && styles.activeTab]}
          onPress={() => setActiveTab('income')}
        >
          <Ionicons name="trending-up" size={20} color={activeTab === 'income' ? '#fff' : '#34C759'} />
          <Text style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>
            Ingresos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>
          Agregar {activeTab === 'income' ? 'Tipo de Ingreso' : 'Tipo de Gasto'}
        </Text>
      </TouchableOpacity>

      {/* Categories List */}
      <ScrollView style={styles.categoriesList} showsVerticalScrollIndicator={false}>
        {(categories[activeTab] || []).map((category, index) => (
          <CategoryItem
            key={index}
            category={category}
            canDelete={category !== 'Otros'}
          />
        ))}
        
        {(!categories[activeTab] || categories[activeTab].length === 0) && (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>
              No hay categorías de {activeTab === 'income' ? 'ingresos' : 'gastos'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Agrega tu primera categoría usando el botón de arriba
            </Text>
          </View>
        )}
      </ScrollView>

      <AddModal />
      <EditModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  categoriesList: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#e6f3ff',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#ffe6e6',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
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
    flex: 1,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e6f3ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default CategoryManager;
