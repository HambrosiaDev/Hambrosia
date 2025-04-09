// ViewPackages.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';

const cities = ['Todos', 'Floresta', 'Cumbayá', 'Iñaquito', 'Valle de los Chillos'];

const packages = [
  {
    id: 1,
    name: 'Burguer King',
    description: 'Algo sustancioso y una bebida',
    discount: 50,
    currentPrice: '$2.50',
    oldPrice: '$5.00',
    city: 'Floresta',
    location: 'Av. Amazonas',
    time: '22:00',
    icon: 'hamburger',
  },
  {
    id: 2,
    name: 'Freshii',
    description: 'Algo refrescante y saludable',
    discount: 60,
    currentPrice: '$2.80',
    oldPrice: '$7.00',
    city: 'Cumbayá',
    location: 'Av. Naciones Unidas',
    time: '21:30',
    icon: 'leaf',
  },
  {
    id: 3,
    name: 'Pan Casero',
    description: 'Algo francés y algo dulce',
    discount: 30,
    currentPrice: '$3.15',
    oldPrice: '$4.50',
    city: 'Floresta',
    location: 'Av. 6 de Diciembre',
    time: '20:00',
    icon: 'bread-slice',
  },
  {
    id: 4,
    name: 'Cinnabon',
    description: 'Algo dulce',
    discount: 30,
    currentPrice: '$4.20',
    oldPrice: '$6.00',
    city: 'Iñaquito',
    location: 'Centro Comercial Iñaquito',
    time: '21:00',
    icon: 'cookie',
  },
];

export default function ViewPackages() {
  const [selectedCity, setSelectedCity] = useState('Todos');
  const [modalVisible, setModalVisible] = useState(false);

  const handleSignOut = () => {
    auth.signOut();
  };

  const filteredPackages = selectedCity === 'Todos' 
    ? packages 
    : packages.filter(pkg => pkg.city === selectedCity);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>HAMBROSÍA</Text>
          <FontAwesome5 name="utensils" size={24} color="#D97706" style={styles.icon} />
        </View>
        <TouchableOpacity style={styles.logOutButton} onPress={handleSignOut}>
          <Text style={styles.logOutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* City Selector */}
      <TouchableOpacity 
        style={styles.citySelector} 
        onPress={() => setModalVisible(true)}
      >
        <FontAwesome5 name="map-marker-alt" size={16} color="#D97706" />
        <Text style={styles.cityText}>{selectedCity}</Text>
        <FontAwesome5 name="chevron-down" size={14} color="#6B7280" />
      </TouchableOpacity>

      {/* City Selection Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Selecciona un sector</Text>
            {cities.map((city) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.modalItem,
                  selectedCity === city && styles.selectedModalItem
                ]}
                onPress={() => {
                  setSelectedCity(city);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{city}</Text>
                {selectedCity === city && (
                  <FontAwesome5 name="check" size={16} color="#D97706" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Packages List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {filteredPackages.length > 0 ? (
          filteredPackages.map((pkg) => (
            <View key={pkg.id} style={styles.card}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name={pkg.icon} size={24} color="#D97706" />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.name}>{pkg.name}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{pkg.discount}%</Text>
                  </View>
                </View>
                
                <Text style={styles.description}>{pkg.description}</Text>

                <View style={styles.priceRow}>
                  <Text style={styles.currentPrice}>{pkg.currentPrice}</Text>
                  <Text style={styles.oldPrice}>{pkg.oldPrice}</Text>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <FontAwesome name="map-marker" size={12} color="#6B7280" />
                    <Text style={styles.metaText}>{pkg.location}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <FontAwesome5 name="stopwatch" size={12} color="#6B7280" />
                    <Text style={styles.metaText}>{pkg.time}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome5 name="map-marked-alt" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No hay paquetes disponibles en {selectedCity}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7ccbe',
    padding: 20,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    bottom: 24,
    padding:10
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#C2410C',
    marginRight: 10,
  },
  logOutButton: {
    backgroundColor: '#CE2C04',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logOutText: {
    color: 'white',
    fontWeight: '600',
  },
  citySelector: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cityText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
    marginHorizontal: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '80%',
    maxHeight: '60%',
    paddingVertical: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItem: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedModalItem: {
    backgroundColor: '#FFFBEB',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 12,
    marginTop: 4,
  },
  name: {
    fontWeight: '600',
    fontSize: 18,
    color: '#1F2937',
    flex: 1,
  },
  discountBadge: {
    backgroundColor: '#2A7C04',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  discountText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  description: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPrice: {
    color: '#B91C1C',
    fontWeight: '700',
    fontSize: 18,
    marginRight: 8,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});