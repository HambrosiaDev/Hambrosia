import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated, ActivityIndicator, Modal, TextInput } from 'react-native';
import { auth } from '../firebaseConfig'
import { useUserStore } from '../user';
import Loading from '@/components/Loading';
import CryptoJS from 'crypto-js';
import { Dimensions } from 'react-native';
import { deleteExpoToken } from '../notifications';


export default function ClientReserves() {
    const underlinePosition = useState(new Animated.Value(0))[0];
    const [activeReserves, setActiveReserves] = useState<Reserve[]>([]);
    const [finishedReserves, setFinishedReserves] = useState<Reserve[]>([]);
    const [cancelledReserves, setCancelledReserves] = useState<Reserve[]>([]);
    const [selectedReserve, setSelectedReserve] = useState<Reserve | null>(null);
    const [activeTab, setActiveTab] = useState<'activos' | 'finalizados' | 'cancelados'>('activos');
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportDescription, setReportDescription] = useState("");

    const [loadingPage, setLoadingPage] = useState(false);

    const secretKey = process.env.EXPO_PUBLIC_SECRET_KEY;
    const hashCedula = (cedula: string) => {
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
        code: string;
        date: string;
        amountPay: number;
        methodPay: string;
        restaurant: string;
        cancelled?: boolean;
    }

    const cedula = useUserStore((state) => state.cedRuc);

    const fetchActiveReserves = async () => {
        try {
            setLoadingPage(true);
            if (cedula) {
                const cedHasheada = hashCedula(cedula);
                const response = await fetch(`https://hambrosia.onrender.com/api/compras/activas/${cedHasheada}`);
                const json = await response.json();
                console.log(json.data)

                if (!Array.isArray(json.data)) {
                    console.warn("Expected 'data' to be an array, but got:", json.data);
                    setActiveReserves([]);
                    return;
                }

                const reserves = json.data.map((item: any) => ({
                    id: item.compraId,
                    code: item.codigo,
                    date: new Date(item.fechaCompra._seconds * 1000).toLocaleDateString(),
                    amountPay: item.precioApagar,
                    methodPay: item.metodoElegido || "",
                    restaurant: item.nombreRestaurante || "",
                    cancelled: item.cancelada || false,
                }));
                console.log(reserves);
                setActiveReserves(reserves);
            }
        } catch (error) {
            console.error('Error fetching active reserves:', error);
        }
        setLoadingPage(false);
    };


    const fetchFinishedReserves = async () => {
        try {
            setLoadingPage(true);
            if (cedula) {
                const cedHasheada = hashCedula(cedula);
                const response = await fetch(`https://hambrosia.onrender.com/api/compras/completadas/${cedHasheada}`);
                const json = await response.json();
                console.log(json.data);
                const reserves = json.data.map((item: any) => ({
                    id: item.compraId,
                    code: item.codigo,
                    date: new Date(item.fechaCompra._seconds * 1000).toLocaleDateString(),
                    amountPay: item.precioApagar,
                    methodPay: item.metodoElegido || "",
                    restaurant: item.nombreRestaurante || "",
                }));
                setFinishedReserves(reserves);
            }
        } catch (error) {
            console.error('Error fetching finished reserves:', error);
        }
        setLoadingPage(false);
    }

    const fetchCancelledReserves = async () => {
        setLoadingPage(true);
        try {
            if (cedula) {
                const cedHasheada = hashCedula(cedula);
                const response = await fetch(`https://hambrosia.onrender.com/api/compras/canceladas/${cedHasheada}`);
                const json = await response.json();
                console.log(json.data);
                const reserves = json.data.map((item: any) => ({
                    id: item.compraId,
                    code: item.codigo,
                    date: new Date(item.fechaCompra._seconds * 1000).toLocaleDateString(),
                    amountPay: item.precioApagar,
                    methodPay: item.metodoElegido || "",
                    restaurant: item.nombreRestaurante || "",
                }));
                setCancelledReserves(reserves);
            }
        } catch (error) {
            console.error('Error fetching finished reserves:', error);
        }
        setLoadingPage(false);
    }

    const handleTabPress = (tab: 'activos' | 'finalizados' | 'cancelados') => {
        setActiveTab(tab);
        console.log(tab)
        if (tab === 'activos') {
            fetchActiveReserves();
        } else if (tab === 'finalizados') {
            fetchFinishedReserves();
        } else {
            console.log("reservas canceladas");
            fetchCancelledReserves();
        }
        const tabToValue = {
            activos: 0,
            finalizados: 0.9,
            cancelados: 1.8,
        };

        Animated.timing(underlinePosition, {
            toValue: tabToValue[tab],
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const deviceWidth = Dimensions.get('window').width;
    const positionInterpolate = underlinePosition;

    const interpolatedPosition = positionInterpolate.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [0, deviceWidth / 3, (deviceWidth / 3) * 2]
    });

    const handleSignOut = () => {
        auth.signOut()
        deleteExpoToken(useUserStore.getState().cedRuc || '');  
        useUserStore.getState().setRole(null);
        useUserStore.getState().setCedRuc("");
        useUserStore.getState().setCiudad("");
    };

    const handleCancel = (reserve: Reserve) => {
        Alert.alert('Cancelar Reserva', `¿Estás seguro de cancelar la reserva? `, [
            { text: 'No' },
            {
                text: 'Sí, cancelar',
                onPress: async () => {
                    console.log(reserve.id);
                    try {
                        const response = await fetch(`https://hambrosia.onrender.com/api/compras/cancelar/${reserve.id}`, {
                            method: 'PUT'
                        });

                        if (response.ok) {
                            setActiveReserves(prev => prev.filter(reserve => reserve.id !== reserve.id));
                            Alert.alert('Reserva cancelada', 'La reserva ha sido cancelada con éxito');
                            fetchActiveReserves();
                        } 
                    } catch (error) {
                        console.error('Cancel error:', error);
                        Alert.alert('Error', 'An error occurred while canceling');
                    }
                }
            },
        ]);
    };

    useEffect(() => {
        fetchActiveReserves();
        setReportModalVisible(false);
    }, []);


    const renderPackageCard = (reserve: Reserve, isActive: boolean) => {
        const reportButtonStyle = {
            backgroundColor: '#FEF3C7',
            borderColor: '#F59E0B',
            flex: 1,
            marginRight: activeTab === 'activos' ? 8 : 0,
        };
        return (

            <View key={reserve.code} style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTextCode}>{reserve.code}</Text>
                    <Text style={styles.cardTextValue}>{reserve.date}</Text>
                </View>

                <View style={styles.paymentMethodContainer}>
                    <Text style={styles.cardTextRestaurant}>{reserve.restaurant}</Text>
                    <Text style={styles.cardTextAmount}>${reserve.amountPay.toFixed(2)}</Text>
                </View>

                <View style={styles.paymentMethodContainer}>
                    <FontAwesome5
                        name={reserve.methodPay === 'Efectivo' ? 'money-bill-wave' : 'credit-card'}
                        size={16}
                        style={styles.paymentIcon}
                    />
                    <Text style={styles.cardTextValue}>{reserve.methodPay}</Text>
                </View>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, reportButtonStyle]}
                        onPress={() => {
                            setSelectedReserve(reserve);
                            setReportModalVisible(true);
                        }}
                    >
                        <Text style={styles.reportButtonText}>Reportar</Text>
                        <FontAwesome5 name="exclamation-triangle" size={14} color="#9C4221" />
                    </TouchableOpacity>

                    {isActive && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => handleCancel(reserve)}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                            <FontAwesome5 name="times-circle" size={16} color="#DC2626" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    const handleReportToRestaurant = (reserveId: string, description: string) => {
        if (!description.trim()) {
            Alert.alert('Error', 'Por favor, ingresa una descripción para el reporte.');
            return;
        }

        const payload = {
            "descripcion": description,
        }
        fetch(`https://hambrosia.onrender.com/api/reportes/cliente-to-restaurante/${reserveId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => {
                if (response.ok) {
                    Alert.alert('Reporte enviado', 'Tu reporte ha sido enviado exitosamente.');
                }else {
                    Alert.alert('Error', 'Ocurrió un error al enviar el reporte. Por favor, inténtalo de nuevo más tarde.', );
                    console.log( response.status, response.statusText);
                }
            })
            .catch(error => {
                console.error('Error al enviar el reporte:', error);
                Alert.alert('Error', 'Ocurrió un error al enviar el reporte.');
            });

    }


    return (
        <View style={styles.container}>
            <View style={styles.backgroundContainer} />

            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <>
                        <TouchableOpacity style={styles.addToCartButton} onPress={() => router.replace('/(tabs)/viewPackages')}>
                            <FontAwesome5 name='chevron-left' size={18} color="#fff" />
                            <Text style={styles.addToCartText}>Regresar</Text>

                        </TouchableOpacity>

                    </>
                </View>

                <TouchableOpacity style={styles.logOutButton} onPress={handleSignOut}>
                    <Text style={styles.logOutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
                {['activos', 'finalizados', 'cancelados'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={styles.tabButton}
                        onPress={() => handleTabPress(tab as 'activos' | 'finalizados' | 'cancelados')}
                    >
                        <FontAwesome5
                            name={
                                tab === 'activos' ? "box" :
                                    tab === 'finalizados' ? "check-circle" :
                                        tab === 'cancelados' ? "times-circle" : "box"
                            }
                            size={15}
                            color={activeTab === tab ? '#fffbeb' : 'rgba(236, 173, 148, 0.9)'}
                        />
                        <Text style={[
                            styles.tabText,
                            activeTab === tab ? styles.activeTabText : styles.inactiveTabText
                        ]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
                <Animated.View
                    style={[
                        styles.tabUnderline,
                        {
                            transform: [{ translateX: interpolatedPosition }],
                            width: `${100 / 3}%`,
                        }
                    ]}
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {loadingPage ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                        <ActivityIndicator size="large" color="#fffbeb" />
                        <Text style={styles.emptyText}>Cargando...</Text>
                    </View>
                ) : (
                    <>
                        {activeTab === 'activos' && activeReserves.length === 0 && (
                            <View style={styles.emptyState}>
                                <FontAwesome5 name="box-open" size={48} color="#fffbeb" />
                                <Text style={styles.emptyText}>No se encuentran reservas activas</Text>
                            </View>
                        )}

                        {activeTab === 'finalizados' && finishedReserves.length === 0 && (
                            <View style={styles.emptyState}>
                                <FontAwesome5 name="box-open" size={48} color="#fffbeb" />
                                <Text style={styles.emptyText}>No se encuentran reservas finalizadas</Text>
                            </View>
                        )}

                        {activeTab === 'cancelados' && cancelledReserves.length === 0 && (
                            <View style={styles.emptyState}>
                                <FontAwesome5 name="box-open" size={48} color="#fffbeb" />
                                <Text style={styles.emptyText}>No se encuentran reservas canceladas</Text>
                            </View>
                        )}

                        {activeTab === 'activos' &&
                            activeReserves.map((reserve) => renderPackageCard(reserve, true))}

                        {activeTab === 'finalizados' &&
                            finishedReserves.map((reserve) => renderPackageCard(reserve, false))}

                        {activeTab === 'cancelados' &&
                            cancelledReserves.map((reserve) => renderPackageCard(reserve, false))}
                    </>
                )}
            </ScrollView>

            <Modal visible={reportModalVisible} transparent animationType="slide" onRequestClose={() => setReportModalVisible(false)}>
                {selectedReserve && (
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.packageModalHeader}>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setReportModalVisible(false)}
                                >
                                    <FontAwesome5 name="times" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.scrollContainer}
                            >
                                <Text style={styles.reportDescription}>Cuentanos el motivo para reportar a  {selectedReserve.restaurant}</Text>
                                <TextInput
                                    value={reportDescription}
                                    onChangeText={setReportDescription}
                                    multiline
                                    placeholder="Cuéntanos qué ocurrió"
                                    placeholderTextColor="#9CA3AF"
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
                                <TouchableOpacity
                                    style={styles.reportButton}
                                    onPress={() => {
                                        handleReportToRestaurant(selectedReserve.id ?? '', reportDescription);
                                        setReportModalVisible(false);
                                        setReportDescription("");
                                    }} >
                                    <Text style={styles.finalReportButtonText}>Reportar</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                )}
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
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 500,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        bottom: 24,
        padding: 10,
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
    addToCartText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 5,
        fontSize: 14,
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
    activeTab: {
        backgroundColor: '#007bff',
    },
    scrollContainer: {
        paddingBottom: 16,
    },
    reportDescription: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 20,
        lineHeight: 24,
    },
    reportButton: {
        backgroundColor: '#D97706',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop:10,
    },
    finalReportButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        marginTop: 6,
        position: 'relative',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        gap: 10,
    },
    tabButton: {
        width: '100%',
        flex: 1,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#fffbeb',
    },
    inactiveTabText: {
        color: 'rgba(236, 173, 148, 0.9)',
    },
    tabUnderline: {
        height: 2,
        backgroundColor: '#fffbeb',
        position: 'absolute',
        bottom: 0,
        width: '22%',
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
        borderLeftColor: '#D97706',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardTextCode: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#D97706',
    },
    cardTextValue: {
        fontSize: 16,
        color: '#374151',
        marginBottom: 8,
        fontWeight: '500',
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
        backgroundColor: '#FEE2E2',
        borderColor: '#DC2626',
        flex: 1,
    },
    cancelButtonText: {
        color: '#DC2626',
        fontWeight: '600',
        marginRight: 8,
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
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
    },
    reportButtonText: {
        color: '#9C4221',
        marginRight: 6,
        fontWeight: '500',
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
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        maxHeight: '90%',
        width: '100%'
    },
});

