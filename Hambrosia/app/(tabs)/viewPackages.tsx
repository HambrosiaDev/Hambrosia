// ViewPackages.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { useUserStore } from '../user';
import { useRouter } from 'expo-router';
import Loading from '@/components/Loading';


const cities = ['Floresta', 'Quito', 'Iñaquito', 'Valle de los Chillos'];

type Package = {
  id: string;
  restauranteId: string;
  nombreRestaurante: string;
  descripcion: string;
  precio: number;
  descuento: number;
  precioDescuento: number;
  imagenURL: string;
  fechaPublicacion?: { _seconds: number; _nanoseconds: number } | string | null;
  horaRetiro?: string | null;
  ciudad: string;
  agotado: boolean;
  unidades: number;
};

export default function ViewPackages() {
  const role = useUserStore((state) => state.role);
  const ciudad = useUserStore((state) => state.ciudad);
  const router = useRouter();

  const [selectedCity, setSelectedCity] = useState(ciudad || 'Quito');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [packagesFetched, setPackagesFetched] = useState<Package[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);


  useEffect(() => {
    if (selectedCity === undefined) {
      setLoadingPage(true);
    }
    else {
      console.log(selectedCity?.toUpperCase(), "ciudad desde el store");
      setLoadingPage(true);
      const fetchPackages = async () => {
        try {
          const response = await fetch(`https://hambrosia.onrender.com/api/paquetes/${selectedCity.toUpperCase()}/`);
          const data = await response.json();

          console.log(data, "data desde el fetch")

          if (data.success && Array.isArray(data.data)) {
            setPackagesFetched(data.data.map((pkg: Package) => ({
              ...pkg,
              imagenURL: pkg.imagenURL && typeof pkg.imagenURL === 'string' ?
                pkg.imagenURL.trim().toLowerCase() :
                'hamburger'
            })));
          } else {
            console.warn("No packages found or error in API:", data.message);
            setPackagesFetched([]);
          }
        } catch (error) {
          console.error('Error fetching packages:', error);
          setPackagesFetched([]);
        } finally {
          setLoadingPage(false);
        }
      };

      fetchPackages();
    }
  }, [selectedCity?.toUpperCase()]);

  useEffect(() => {
    setTimeout(() => {
      setLoadingPage(false);
    }, 3000);
  }, []);
  if (loadingPage) return <Loading />

  const handleSignOut = () => {
    auth.signOut();
  };


  const formatPrice = (price: number) => {
    return price.toPrecision(2);
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  if (selectedCity === undefined) {
    return <Loading />;
  }

  const renderIcon = (iconName: string) => {
    const validIcons = ['hamburger',
      'cookie',
      'pizza-slice',
      'leaf',
      'drumstick-bite',
      'apple-alt',
      'coffee',
      'ice-cream',
      'bread-slice'];
    const safeIconName = validIcons.includes(iconName) ? iconName : 'hamburger';
    return <FontAwesome5 name={safeIconName} size={35} color="#D97706" />;
  };

  const formatFirestoreTimestamp = (
    timestamp: { _seconds: number; _nanoseconds: number } | string | undefined | null
  ): string => {
    if (!timestamp) return 'Hora no disponible';

    if (typeof timestamp === 'string') return timestamp;

    if (typeof timestamp !== 'object' || typeof timestamp._seconds !== 'number') {
      console.warn('Formato de timestamp inválido:', timestamp);
      return 'Hora inválida';
    }

    try {
      const date = new Date(0);
      date.setUTCSeconds(timestamp._seconds);

      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');

      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Error al formatear la hora:', error);
      return 'Error en hora';
    }
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>HAMBROSÍA</Text>
          <FontAwesome5 name="utensils" size={24} color="#D97706" style={styles.icon} />
        </View>
        {role === "RESTAURANTE" && (
          <><TouchableOpacity style={styles.addToCartButton} onPress={() => router.replace('/(tabs)/createPackage')}>
            <FontAwesome5 name='plus-circle' size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.checkCodeButton} onPress={() => router.replace('/(tabs)/createPackage')}>
              <FontAwesome5 name='spell-check' size={18} color="#fff" />
            </TouchableOpacity></>
        )}
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
        {packagesFetched.length > 0 ? (
          packagesFetched.map((pkg) => (
            <Pressable key={pkg.id} onPress={() => setSelectedPackage(pkg)}>
              <View style={styles.card}>
                <View style={styles.iconContainer}>
                  {renderIcon(pkg.imagenURL)}
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.name}>{pkg.nombreRestaurante}</Text>
                    {pkg.descuento > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{formatPrice(Number(pkg.descuento))}% OFF</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.description}>{pkg.descripcion}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.currentPrice}>${pkg.precioDescuento}</Text>
                    {pkg.descuento > 0 && (
                      <Text style={styles.oldPrice}>${formatPrice(Number(pkg.precio))}</Text>
                    )}
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <FontAwesome name="map-marker" size={12} color="#6B7280" />
                      <Text style={styles.metaText}>{capitalizeFirstLetter(pkg.ciudad)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <FontAwesome5 name="stopwatch" size={12} color="#6B7280" />
                      <Text style={styles.metaText}>{formatFirestoreTimestamp(pkg.horaRetiro)}</Text>
                    </View>
                  </View>
                  {role === "CLIENTE" && (
                    <TouchableOpacity style={styles.addToCartButton} onPress={() => console.log(pkg.id)}>
                      <FontAwesome name='cart-plus' size={20} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome5 name="map-marked-alt" size={48} color="#303030" />
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
    padding: 10
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
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
  addToCartButton: {
    top: 5,
    backgroundColor: '#D97706',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkCodeButton: {
    top: 5,
    backgroundColor: '#D97706',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
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
    paddingVertical: 7,
    paddingHorizontal: 15,
    marginLeft: 8,
    justifyContent: 'center',
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