// ViewPackages.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Pressable, TextInput, Alert } from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { useUserStore } from '../user';
import { useRouter } from 'expo-router';
import Loading from '@/components/Loading';
import CryptoJS from 'crypto-js';


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
  direccion: string;
  alergenos: string[];
  metodoPago: string[];
};




const secretKey = process.env.EXPO_PUBLIC_SECRET_KEY;
const hashCedula = (cedula: string) => {
  console.log("Clave " + secretKey);
  if (!secretKey) {
    throw new Error("Secret key is not defined");
  }
  return CryptoJS.HmacSHA256(
    `${cedula}:${secretKey}`,
    secretKey
  ).toString(CryptoJS.enc.Hex);
};


export default function ViewPackages() {
  const role = useUserStore((state) => state.role);
  const ciudad = useUserStore((state) => state.ciudad);
  const cedula = useUserStore((state) => state.cedRuc);
  const router = useRouter();

  const [selectedCity, setSelectedCity] = useState(ciudad || 'Quito');
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [packageModalVisible, setPackageModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [packagesFetched, setPackagesFetched] = useState<Package[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [amountPackage, setAmountPackage] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCity === undefined || role === undefined) {
      setLoadingPage(true);
    }
    else {
      console.log(selectedCity?.toUpperCase(), "ciudad desde el store");
      setLoadingPage(true);

      fetchPackages();
    }
  }, [selectedCity?.toUpperCase()]);

  const fetchPackages = async () => {
    try {
      setLoadingPage(true);
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


  useEffect(() => {
    setTimeout(() => {
      setLoadingPage(false);
    }, 3000);
  }, []);

  if (loadingPage) return <Loading />

  const handleSignOut = () => {
    auth.signOut();
    useUserStore.getState().setRole(null);
    useUserStore.getState().setCedRuc("");
    useUserStore.getState().setCiudad("");
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


  const handleReserve = async (pkg: Package) => {
    try {
      setLoadingPage(true);
      const payload = {
        cantidadComprada: amountPackage,
        restauranteId: pkg.restauranteId,
        clienteId: hashCedula(cedula || ''),
        metodoElegido: selectedPaymentMethod
          ?.normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, '_')
          .toUpperCase()
      };

      console.log("Compra payload", payload);

      const response = await fetch(`https://hambrosia.onrender.com/api/compras/${pkg.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend compra failed: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log("Purchase successful:", responseData);

      Alert.alert("Éxito", "Registro completado correctamente 🎉");
      setPackageModalVisible(false);
      setAmountPackage(1);
    } catch (error) {
      console.error("Error in handleReserve:", error);
      Alert.alert("Error", "No se pudo completar la compra. Por favor intente nuevamente.");
    }
    setLoadingPage(false);
  };

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

  const iconNamesMap = {
    'hamburger': 'Hamburguesa',
    'cookie': 'Galleta',
    'pizza-slice': 'Pizza',
    'leaf': 'Ensaladas',
    'drumstick-bite': 'Pollo',
    'apple-alt': 'Fruta',
    'coffee': 'Cafetería',
    'ice-cream': 'Helados',
    'bread-slice': 'Panadería',
  };

  const formatFirestoreTimestamp = (
    timestamp: { _seconds: number; _nanoseconds: number } | string | undefined | null
  ): string => {
    if (!timestamp) return 'Hora no disponible';

    // Handle ISO string input (e.g., "2025-05-15T11:59:00.000Z")
    if (typeof timestamp === 'string' && timestamp.includes('T')) {
      try {
        const date = new Date(timestamp);
        const utcMinus5 = new Date(date.getTime() + 0 * 60 * 60 * 1000);

        const hours = utcMinus5.getUTCHours().toString().padStart(2, '0');
        const minutes = utcMinus5.getUTCMinutes().toString().padStart(2, '0');

        return `${hours}:${minutes}`;
      } catch (error) {
        console.error('Error al formatear la hora ISO:', error);
        return 'Hora inválida';
      }
    }

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

  const fetchPackagesIcon = async (icon: string) => {
    try {
      setLoadingPage(true);
      const response = await fetch(`https://hambrosia.onrender.com/api/paquetes/getPaquetesBy/${selectedCity.toUpperCase()}/${icon}`);
      const data = await response.json();
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
    }
    setLoadingPage(false);
  };


  const openPackageDetails = (pkg: Package) => {
    setSelectedPackage(pkg);
    setPackageModalVisible(true);
  };


  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {role === "RESTAURANTE" && (
            <><TouchableOpacity style={styles.addToCartButton} onPress={() => router.replace('/(tabs)/createPackage')}>
              <FontAwesome5 name='plus-circle' size={20} color="#fff" />
              <Text style={styles.addToCartText}>Paquete</Text>
            </TouchableOpacity>
              <TouchableOpacity style={styles.addToCartButton} onPress={() => router.replace('/(tabs)/restaurantReserves')}>
                <FontAwesome5 name='wallet' size={18} color="#fff" />
                <Text style={styles.addToCartText}>Reservas</Text>

              </TouchableOpacity></>
          )}
          {role === "CLIENTE" && (
            <><TouchableOpacity style={styles.addToCartButton} onPress={() => router.replace('/(tabs)/clientReserves')}>
              <FontAwesome5 name='shopping-basket' size={20} color="#fff" />
              <Text style={styles.addToCartText}>Mis Compras</Text>

            </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.logOutButton} onPress={handleSignOut}>
          <Text style={styles.logOutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* City Selector */}
      <TouchableOpacity
        style={styles.citySelector}
        onPress={() => setCityModalVisible(true)}
      >
        <FontAwesome5 name="map-marker-alt" size={16} color="#D97706" />
        <Text style={styles.cityText}>{selectedCity}</Text>
        <FontAwesome5 name="chevron-down" size={14} color="#6B7280" />
      </TouchableOpacity>

      {/* City Selection Modal */}
      <Modal visible={cityModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setCityModalVisible(false)}
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
                  setCityModalVisible(false);
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

      {/* Icon Buttons */}
      <View style={styles.buttonContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 5 }}>
          <View style={styles.iconButtonContainer}>
            <TouchableOpacity
              style={[
                styles.iconButton,
                selectedIcon === "utensils" && styles.selectedIconButton
              ]}
              onPress={() => {
                setSelectedIcon("utensils");
                fetchPackages();
              }}
            >
              <FontAwesome5 name="utensils" size={25} color={selectedIcon == "utensils" ? "#D97706" : "#fffbeb"} />
              {selectedIcon === "utensils" ? (
                <Text style={styles.textIcon}>
                  Todos los paquetes
                </Text>
              ) : (
                null)}
            </TouchableOpacity>
            {(['hamburger', 'cookie', 'pizza-slice', 'leaf', 'drumstick-bite', 'apple-alt', 'coffee', 'ice-cream', 'bread-slice'] as (keyof typeof iconNamesMap)[]).map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconButton,
                  selectedIcon === icon && styles.selectedIconButton
                ]}
                onPress={() => {
                  setSelectedIcon(icon);
                  fetchPackagesIcon(icon);
                }}
              >
                <FontAwesome5 name={icon} size={25} color={selectedIcon == icon ? "#D97706" : "#fffbeb"} />
                {selectedIcon === icon ? (
                  <Text style={styles.textIcon}>
                    {iconNamesMap[icon] || icon}
                  </Text>
                ) : (
                  null)}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>


      {/* Packages List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {packagesFetched.length > 0 ? (
          packagesFetched.map((pkg) => (
            <Pressable key={pkg.id} onPress={() => openPackageDetails(pkg)}>
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
                    <TouchableOpacity style={styles.cardBuyButton} onPress={() => openPackageDetails(pkg)}>
                      <FontAwesome name='cart-plus' size={20} color="#fffbeb" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome5 name="map-marked-alt" size={48} color="#fffbeb" />
            <Text style={styles.emptyText}>No hay paquetes disponibles en {selectedCity}</Text>
          </View>
        )}
      </ScrollView>

      {/* Package Details Modal */}
      <Modal visible={packageModalVisible} transparent animationType="slide">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          style={{ maxHeight: '100%' }}>
          <View style={styles.packageModalOverlay}>
            <View style={styles.packageModalContainer}>
              {selectedPackage && (
                <>
                  <View style={styles.packageModalHeader}>
                    <Text style={styles.packageModalTitle}>{selectedPackage.nombreRestaurante}</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setPackageModalVisible(false)}
                    >
                      <FontAwesome5 name="times" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.packageModalContent}>
                    <View style={styles.packageIconContainer}>
                      {renderIcon(selectedPackage.imagenURL)}
                    </View>

                    <Text style={styles.packageDescription}>{selectedPackage.descripcion}</Text>

                    <View style={styles.packageDetailsRow}>
                      <View style={[styles.detailItem, { left: 5 }]}>
                        <FontAwesome5 name="map-marker-alt" size={16} color="#D97706" />
                        <Text style={styles.detailText}>{capitalizeFirstLetter(selectedPackage.ciudad)}</Text>
                      </View>

                      <View style={styles.detailItem}>
                        <FontAwesome5 name="clock" size={16} color="#D97706" />
                        <Text style={styles.detailText}>
                          {formatFirestoreTimestamp(selectedPackage.horaRetiro)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.packageDetailsRow}>
                      <View style={styles.detailItem}>
                        <FontAwesome5 name="box-open" size={16} color="#D97706" />
                        <Text style={styles.detailText}>
                          {selectedPackage.unidades} {selectedPackage.unidades === 1 ? 'unidad disponible' : 'unidades disponibles'}
                        </Text>
                      </View>

                    </View>

                    <View style={styles.detailItem}>
                      <FontAwesome name="map" size={16} color="#D97706" />
                      <Text style={styles.detailText}>
                        {selectedPackage.direccion}
                      </Text>
                    </View>

                    <View style={styles.priceContainer}>
                      {selectedPackage.descuento > 0 && (
                        <Text style={styles.originalPrice}>${formatPrice(Number(selectedPackage.precio))}</Text>
                      )}
                      <Text style={styles.finalPrice}>${selectedPackage.precioDescuento}</Text>
                      {selectedPackage.descuento > 0 && (
                        <View style={styles.discountTag}>
                          <Text style={styles.discountTagText}>{formatPrice(selectedPackage.descuento)}% OFF</Text>
                        </View>
                      )}
                    </View>

                    {role === "CLIENTE" && (
                      <>
                        <View style={styles.packageDetailsAmount}>
                          <TouchableOpacity
                            style={styles.detailItem}
                            onPress={() => setAmountPackage((prev) => Math.max(prev - 1, 1))}
                          >
                            <FontAwesome name="minus-circle" size={25} color="#D97706" />
                          </TouchableOpacity>
                          <Text style={styles.detailTextAmount}>{amountPackage}</Text>
                          <TouchableOpacity
                            style={styles.detailItem}
                            onPress={() => setAmountPackage((prev) => Math.min(prev + 1, selectedPackage.unidades))}
                          >
                            <FontAwesome5 name="plus-circle" size={25} color="#D97706" />
                          </TouchableOpacity>

                        </View>
                        <View style={styles.paymentContainer}>
                          <Text style={styles.detailTextCompra}>
                            Selecciona el método de pago al momento de retirar el paquete:
                          </Text>

                          {selectedPackage.metodoPago.map((metodo, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.radioOption}
                              onPress={() => setSelectedPaymentMethod(metodo)}
                            >
                              <View style={styles.radioCircle}>
                                {selectedPaymentMethod === metodo && <View style={styles.selectedRb} />}
                              </View>
                              <Text style={styles.radioText}>
                                {metodo.replace(/_/g, ' ')
                                  .toLowerCase()
                                  .replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        <TouchableOpacity
                          style={styles.buyButton}
                          onPress={() => {
                            handleReserve(selectedPackage);
                            setAmountPackage(1);
                          }}
                        >
                          <Text style={styles.buyButtonText}>Comprar</Text>
                        </TouchableOpacity>


                      </>
                    )}

                    <View style={styles.detailAlergenos}>
                      <FontAwesome5 name="comment-medical" size={25} color="#CE2C04" />
                      {selectedPackage.alergenos && selectedPackage.alergenos.length > 0 ? (
                        <Text style={styles.alergenosText}>
                          El restaurante que preparó este paquete para ti trabaja con: {selectedPackage.alergenos.join(', ')}
                        </Text>
                      ) : (
                        <Text style={styles.alergenosText}>
                          El restaurante no ha especificado alérgenos para este paquete.
                        </Text>

                      )}

                    </View>

                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </Modal>

    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    padding: 20,
    paddingTop: 30,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: '#C2410C',
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
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
    gap: 10,
  },
  addToCartText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
    fontSize: 14,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cardBuyButton: {
    top: 5,
    backgroundColor: 'rgba(194, 64, 12, 0.75)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  checkCodeButton: {
    top: 5,
    backgroundColor: '#D97706',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#D97706',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 5,
  },
  selectedIconButton: {
    backgroundColor: '#fffbeb',
  },
  textIcon: {
    color: '#D97706',
    fontSize: 16,
    fontWeight: '600',
  },
  iconContainer: {
    width: 50,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 10,
  },
  buttonContainer: {
    marginBottom: 10,
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
    padding: 30,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fffbeb',
    textAlign: 'center',
  },
  packageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  packageModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  packageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  packageModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  packageModalContent: {
    paddingBottom: 20,
  },
  packageIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  packageDescription: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
    lineHeight: 24,
  },
  packageDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  packageDetailsAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  detailTextAmount: {
    fontSize: 20,
    color: '#4B5563',
    marginLeft: 8,
    marginRight: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  originalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  finalPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 12,
  },
  discountTag: {
    backgroundColor: '#2A7C04',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  discountTagText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buyButton: {
    backgroundColor: '#D97706',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailAlergenos: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 15,
    borderRadius: 8,
  },
  alergenosText: {
    fontSize: 15,
    color: '#4B5563',
    marginLeft: 8,
    right: 8,
    padding: 5,
  },
  paymentContainer: {
    marginTop: 12,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  radioOption: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D97706',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  detailTextCompra: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 5,
  },
});