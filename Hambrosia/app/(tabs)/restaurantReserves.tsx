import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { auth } from '../firebaseConfig'
import { useUserStore } from '../user';
import Loading from '@/components/Loading';
import CryptoJS from 'crypto-js';


export default function ClientReserves() {
    const [activeTab, setActiveTab] = useState<'activos' | 'finalizados'>('activos');
    const underlinePosition = useState(new Animated.Value(0))[0];
    const [activeReserves, setActiveReserves] = useState<Reserve[]>([]);
    const [finishedReserves, setFinishedReserves] = useState<Reserve[]>([]);
    const [selectedReserve, setSelectedReserve] = useState<Reserve | null>(null);

    const SECRET_KEY = "ceD_haShInG$ystem!2025@Hambrosia2025";
    const hashCedula = (cedula: string) => {
        return CryptoJS.HmacSHA256(
            `${cedula}:${SECRET_KEY}`,
            SECRET_KEY
        ).toString(CryptoJS.enc.Hex);
    };

    type Reserve = {
        id?: string;
        code: string;
        date: string;
        amountPay: number;
        methodPay: string;
        restaurant: string;
    }

    const cedula = useUserStore((state) => state.cedRuc);




    const fetchActiveReserves = async () => {
        try {
            if (cedula) {
                const cedHasheada = hashCedula(cedula);
                console.log(cedHasheada)
                const response = await fetch(`https://hambrosia.onrender.com/api/compras/activas/${cedHasheada}`);
                const json = await response.json();
                console.log(json.data)

                if (!Array.isArray(json.data)) {
                    console.warn("Expected 'data' to be an array, but got:", json.data);
                    setActiveReserves([]);
                    return;
                }

                const reserves = json.data.map((item: any) => ({
                    id: item.metadata?.id,
                    code: item.codigo,
                    date: new Date(item.fechaCompra._seconds * 1000).toLocaleDateString(),
                    amountPay: item.precioApagar,
                    methodPay: item.metodoElegido || "",
                    restaurant: item.nombreRestaurante || "",
                }));
                console.log(reserves);
                setActiveReserves(reserves);
            }
        } catch (error) {
            console.error('Error fetching active reserves:', error);
        }
    };




    const handleTabPress = (tab: 'activos' | 'finalizados') => {
        setActiveTab(tab);
        if (tab === 'activos') {
            fetchActiveReserves();
        } else {
        }
        Animated.timing(underlinePosition, {
            toValue: tab === 'activos' ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const interpolatedPosition = underlinePosition.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '50%']
    });

    const handleSignOut = () => {
        auth.signOut()
    };



    useEffect(() => {
        fetchActiveReserves();
    }, []);


    const renderPackageCard = (reserve: Reserve, isActive: boolean) => (
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

            {isActive && (
                <TouchableOpacity
                    style={styles.cancelButton}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                    <FontAwesome5 name="times-circle" size={16} color="#DC2626" />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={() => router.replace('/(tabs)/viewPackages')}
                    >
                        <FontAwesome5 name='chevron-left' size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>HAMBROSÍA</Text>
                    <FontAwesome5 name="utensils" size={24} color="#D97706" style={styles.icon} />
                </View>

                <TouchableOpacity style={styles.logOutButton} onPress={handleSignOut}>
                    <Text style={styles.logOutText}>Salir</Text>
                </TouchableOpacity>
            </View>
            <Text style={[styles.title, { alignSelf: 'center', justifyContent: 'center' }]}>Mis Paquetes</Text>

            <View style={styles.tabContainer}>
                {['activos', 'finalizados'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={styles.tabButton}
                        onPress={() => handleTabPress(tab as 'activos' | 'finalizados')}
                    >
                        <FontAwesome5
                            name={tab === 'activos' ? "box" : "check-circle"}
                            size={16}
                            color={activeTab === tab ? '#D97706' : '#6B7280'}
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
                        { left: interpolatedPosition }
                    ]}
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {activeReserves.length === 0 && activeTab === 'activos' ? (
                    <View style={styles.emptyState}>
                        <FontAwesome5 name="box-open" size={48} color="#303030" />
                        <Text style={styles.emptyText}>No se encuentran reservas activas</Text>
                    </View>
                ) : null}
                {finishedReserves.length === 0 && activeTab != 'activos' ? (
                    <View style={styles.emptyState}>
                        <FontAwesome5 name="box-open" size={48} color="#303030" />
                        <Text style={styles.emptyText}>No se encuentran reservas finalizadas</Text>
                    </View>
                ) : null}
                {activeTab === 'activos'
                    ? activeReserves.map((reserve) => renderPackageCard(reserve, true))
                    : finishedReserves.map((reserve) => renderPackageCard(reserve, false))}
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
    addToCartButton: {
        backgroundColor: '#D97706',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 20,
    },
    icon: {
        marginRight: 12,
        marginTop: 4,
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
        marginTop: 5,
        padding: 12,
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
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
        color: '#6B7280',
        textAlign: 'center',
    },
});

