import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated, Modal, TextInput, ActivityIndicator } from 'react-native';
import { auth } from '../firebaseConfig'
import { useUserStore } from '../user';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import CryptoJS from 'crypto-js';


export default function ClientReserves() {
    const [activeReserves, setActiveReserves] = useState<Reserve[]>([]);
    const [finishedReserves, setFinishedReserves] = useState<Reserve[]>([]);
    const [validationModalVisible, setValidationModalVisible] = useState(false);
    const [validationCode, setValidationCode] = useState('');
    const [selectedRating, setSelectedRating] = useState(0);
    const [selectedReserve, setSelectedReserve] = useState<Reserve | null>(null);
    const [loadingPage, setLoadingPage] = useState(false);

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


    type Reserve = {
        id?: string;
        date: string;
        clientId: string;
        amountPay: number;
        methodPay: string;
        clientName: string;
        amount: number;
        isPayed?: boolean;
    }

    const ruc = useUserStore((state) => state.cedRuc);

    const fetchTodayReserves = async () => {
        try {
            setLoadingPage(true);
            if (ruc) {
                const cedHasheada = hashCedula(ruc);
                console.log(cedHasheada)
                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth() + 1;
                const day = today.getDate();

                const formatted = `${year}-${month}-${day}`;
                console.log(formatted);
                const response = await fetch(`https://hambrosia.onrender.com/api/compras/getCompras/${cedHasheada}/${formatted}`);
                const json = await response.json();
                console.log(json.data)

                if (!Array.isArray(json.data)) {
                    console.warn("Expected 'data' to be an array, but got:", json.data);
                    setActiveReserves([]);
                    setLoadingPage(false);

                    return;

                }

                const reserves = json.data.map((item: any) => ({
                    id: item.compraId,
                    date: new Date(item.fechaCompra._seconds * 1000).toLocaleDateString(),
                    amountPay: item.precioApagar,
                    methodPay: item.metodoElegido || "",
                    clientId: item.clienteId || "",
                    clientName: item.nombreCliente || "",
                    amount: item.cantidadComprada || 0,
                    isPayed: item.pagado || false,
                }));
                console.log(reserves);
                setActiveReserves(reserves);
            }
        } catch (error) {
            console.error('Error fetching active reserves:', error);
        }
        setLoadingPage(false);

    };


    const handleSignOut = () => {
        auth.signOut();
        useUserStore.getState().setRole(null);
        useUserStore.getState().setCedRuc("");
        useUserStore.getState().setCiudad("");
    };

    useEffect(() => {
        console.log("reservas restaurante")
        fetchTodayReserves();
    }, [ruc]);

    const validateCode = async (reserve: Reserve) => {
        const payload = {
            codigo: validationCode,
            calificacion: selectedRating,
        }
        console.log(payload);

        try {
            const response = await fetch(`https://hambrosia.onrender.com/api/compras/confirmar/${reserve.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            setValidationCode('');
            setSelectedRating(0);

        } catch (error) {
            console.error('Error validating code:', error);
            Alert.alert('Error', 'Hubo un problema al validar el código.');
        }
    }

    const handleReportClient = async(reserve: Reserve)=>{
        const payload = {
            descripcion: `El cliente ${reserve.clientName}, no llegó a retirar la compra con fecha ${reserve.date}, de ${reserve.amountPay} con ${reserve.amount} unidades`
        }
        console.log(payload);

        try {
            const response = await fetch(`https://hambrosia.onrender.com/api/reportes/crearReporte/${reserve.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            setValidationCode('');
            setSelectedRating(0);

        } catch (error) {
            console.error('Error reporting client:', error);
            Alert.alert('Error', 'Hubo un problema al reportar el cliente.');
        }
    }



    const renderPackageCard = (reserve: Reserve, isActive: boolean) => (
        <View key={reserve.id} style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTextCode}>{reserve.clientName}</Text>
                <Text style={styles.cardTextValue}>{reserve.date}</Text>
            </View>

            <View style={styles.paymentMethodContainer}>
                <Text style={styles.cardTextAmount}>${reserve.amountPay.toFixed(2)}</Text>
            </View>

            <View style={styles.cardDescriptionContainer}>

                <View style={styles.paymentMethodContainer}>
                    <FontAwesome5
                        name={reserve.methodPay === 'Efectivo' ? 'money-bill-wave' : 'credit-card'}
                        size={16}
                        style={styles.paymentIcon}
                    />
                    <Text style={styles.cardTextValue}>{reserve.methodPay}</Text>
                </View>
                <View style={styles.paymentMethodContainer}>
                    <FontAwesome5
                        name="box"
                        size={16}
                        style={styles.paymentIcon}
                    />
                    <Text style={styles.cardTextValue}>
                        {reserve.amount} reservado{reserve.amount !== 1 ? 's' : ''}
                    </Text>
                </View>
            </View>

            {reserve.isPayed === false ? (
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => { setValidationModalVisible(true), setSelectedReserve(reserve) }}
                >
                    <Text style={styles.cancelButtonText}>Validar Código</Text>
                    <FontAwesome5 name="spell-check" size={16} color="#DC2626" />
                </TouchableOpacity>
            ) : (
                <View style={styles.retiredTextContainer}>
                    <Text style={styles.finishedTextValue}>Retirado</Text>
                    <FontAwesome5 name="check-circle" size={16} color="#2A7C04" />

                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.backgroundContainer} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <>
                        <TouchableOpacity style={styles.addToCartButton} onPress={() => router.replace('/(tabs)/viewPackages')}>
                            <FontAwesome5 name='chevron-left' size={18} color="#fff" />
                            <Text style={styles.addToCartText}>Regresar</Text>

                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addToCartButton} onPress={() => router.replace('/(tabs)/createPackage')}>
                            <FontAwesome5 name='plus-circle' size={20} color="#fff" />
                            <Text style={styles.addToCartText}>Paquete</Text>
                        </TouchableOpacity>
                    </>
                </View>

                <TouchableOpacity style={styles.logOutButton} onPress={handleSignOut}>
                    <Text style={styles.logOutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.title}>Reservas</Text>

            {/* Tabs */}
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {loadingPage ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                        <ActivityIndicator size="large" color="#fffbeb" />
                        <Text style={styles.emptyText}>Cargando...</Text>
                    </View>
                ) : activeReserves.length === 0 ? (
                    <View style={styles.emptyState}>
                        <FontAwesome5 name="box-open" size={48} color="#fffbeb" />
                        <Text style={styles.emptyText}>No se encuentran reservas</Text>
                    </View>
                ) : (
                    activeReserves.map((reserve) => renderPackageCard(reserve, true))
                )}


            </ScrollView>


            <Modal visible={validationModalVisible} transparent animationType="slide">
                <View style={styles.packageModalOverlay}>
                    <View style={styles.packageModalContainer}>
                        <View style={styles.packageModalHeader}>
                            <FontAwesome5 name="check-circle" size={24} color="#D97706" style={styles.icon} />
                            <Text style={styles.packageModalTitle}>Validación Código</Text>
                            <TouchableOpacity
                                onPress={() => setValidationModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <FontAwesome5 name="times" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.packageModalContent}>
                            <Text style={styles.packageDescription}>Ingresa el código de validación proporcionado por el cliente.</Text>
                            <TextInput
                                value={validationCode}
                                onChangeText={setValidationCode}
                                placeholder="Ej: ABCD1234"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="characters"
                                autoCorrect={false}
                                keyboardType='numeric'
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#D97706',
                                    borderRadius: 8,
                                    padding: 10,
                                    marginTop: 10,
                                    backgroundColor: '#fff',
                                    color: '#1F2937',
                                    fontSize: 16,
                                    fontWeight: '500',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                }}
                            />

                            {/* Star Rating Section */}
                            <View style={{ marginTop: 20 }}>
                                <Text style={{ color: '#1F2937', marginBottom: 10, fontWeight: '500' }}>
                                    Califica el restaurante:
                                </Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity
                                            key={star}
                                            onPress={() => setSelectedRating(star)}
                                            style={{ padding: 5 }}
                                        >
                                            <FontAwesome5
                                                name={star <= selectedRating ? "star" : "star"}
                                                size={38}
                                                color={star <= selectedRating ? "#C2410C" : "#E5E7EB"}
                                                solid={star <= selectedRating}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.buyButton}
                            onPress={() => {
                                validateCode(selectedReserve!);
                                setValidationModalVisible(false);
                            }} >
                            <Text style={styles.buyButtonText}>Validar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.logOutButton, { marginTop: 10 }]}
                            onPress={() => {
                                if (selectedReserve) {
                                    handleReportClient(selectedReserve);
                                }
                                setValidationModalVisible(false);
                            }} >
                            <Text style={styles.buyButtonText}>Reportar a un cliente</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
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
        height: '65%',
        backgroundColor: '#C2410C',
        borderBottomLeftRadius: 500,
        borderBottomRightRadius: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        bottom: 24,
        padding: 10
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
    icon: {
        marginRight: 12,
        marginTop: 4,
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
        color: '#fffbeb',
        marginRight: 10,
        marginBottom: 16,
        marginLeft: 10,
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
    activeTab: {
        backgroundColor: '#007bff',
    },
    scrollContainer: {
        paddingBottom: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        marginTop: 16,
        position: 'relative',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tabButton: {
        width: '100%',
        flex: 1,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    tabText: {
        fontSize: 18,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#D97706',
    },
    inactiveTabText: {
        color: '#6B7280',
    },
    tabUnderline: {
        position: 'absolute',
        bottom: -1,
        width: '50%',
        height: 2,
        backgroundColor: '#D97706',
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#D97706', // Accent border
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardTextCode: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#D97706',
    },
    cardTextValue: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    finishedTextValue: {
        fontSize: 16,
        color: '#2A7C04',
        fontStyle: 'italic',
        fontWeight: '500',
        marginRight: 8,
    },
    cardTextRestaurant: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginVertical: 8,
        width: '75%',
    },
    cardTextAmount: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#2A7C04',
        width: '75%',
    },
    paymentMethodContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    retiredTextContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        alignContent: 'center',
        backgroundColor: '#E5FFEA',
        padding: 8,
        borderRadius: 8,
    },
    cardDescriptionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 30,
        paddingHorizontal: 10,
    },
    paymentIcon: {
        marginRight: 8,
        color: '#6B7280',
    },
    cancelButton: {
        flexDirection: 'row',
        marginTop: 15,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 20,
        shadowRadius: 5,
        elevation: 3,
    },
    cancelButtonText: {
        color: '#DC2626',
        fontWeight: '600',
        marginRight: 10
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
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
    packageDescription: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 20,
        lineHeight: 24,
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
});

