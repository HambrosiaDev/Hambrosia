import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    StyleSheet,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { useRouter } from 'expo-router';
import { useUserStore } from '../user';
import Loading from '@/components/Loading';



const iconOptions = [
    'hamburger',
    'cookie',
    'pizza-slice',
    'leaf',
    'drumstick-bite',
    'apple-alt',
    'coffee',
    'ice-cream',
    'bread-slice',
];

export default function CreatePackageScreen() {
    const navigation = useNavigation();
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [discountedPrice, setDiscountedPrice] = useState('');
    const [units, setUnits] = useState('');
    const [pickupTimeHour, setPickupTimeHour] = useState('');
    const [pickupTimeMin, setPickupTimeMin] = useState('');
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
    const router = useRouter();
    const { cedRuc } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);


    const handleSignOut = () => {
        auth.signOut();
        useUserStore.getState().setRole(null);
        useUserStore.getState().setCedRuc("");
        useUserStore.getState().setCiudad("");
    };

    const setToNull = () => {
        setDescription("");
        setPrice("");
        setDiscountedPrice("");
        setUnits("");
        setSelectedIcon("");
        setPickupTimeHour("");
        setPickupTimeMin("");
    }

    const validateData = () => {
        if (!description || !price || !discountedPrice || !units || !pickupTimeHour || !pickupTimeMin || !selectedIcon) {
            Alert.alert('Campos incompletos', 'Por favor completa todos los campos');
            return false;
        }

        if (Number(discountedPrice) >= Number(price)) {
            Alert.alert('Precios incorrectos', 'El precio con descuento debe ser menor al PVP');
            return false;
        }

        if (Number(price) <= 0 || Number(discountedPrice) <= 0) {
            Alert.alert('Precio inválido', 'Los precios deben ser mayores que 0');
            return false;
        }

        if (Number(units) <= 0) {
            Alert.alert('Unidades inválidas', 'Debes ingresar al menos una unidad');
            return false;
        }

        if (isNaN(Number(pickupTimeHour)) || isNaN(Number(pickupTimeMin)) || Number(pickupTimeHour) < 0 || Number(pickupTimeHour) > 23 || Number(pickupTimeMin) < 0 || Number(pickupTimeMin) > 59) {
            Alert.alert('Hora inválida', 'Ingresa una hora válida (0-23) y minutos válidos (0-59)');
            return false;
        }
        return true;
    };


    const handleSubmit = async () => {
        setIsLoading(true)
        validateData();
        const payload = {
            descripcion: description,
            precioDescuento: Number(discountedPrice),
            precio: Number(price),
            unidades: Number(units),
            horaRetiro: pickupTimeHour + ":" + pickupTimeMin,
            imagenURL: selectedIcon,
        };
        try {
            const payload = {
                descripcion: description,
                precioDescuento: Number(discountedPrice),
                precio: Number(price),
                unidades: Number(units),
                horaRetiro: pickupTimeHour + ":" + pickupTimeMin,
                imagenURL: selectedIcon,
            };

            const response = await fetch(`https://hambrosia.onrender.com/api/paquetes/${cedRuc}/crearPaquete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });


            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Backend registration package failed: ${response.status} - ${errorText}`);
            }
            Alert.alert("Éxito", "Registro completado correctamente 🎉");
            setToNull();
        } catch (e: any) {
            console.error("Package registration error:", e);
            Alert.alert("Error", `Registro del paquete fallido: ${e.message}`);
        }
        console.log(payload)
        setIsLoading(false);
    };

    if(isLoading){
        return(
            <Loading />
        )
    }

    return (
        <View style={styles.container}>
            {/* Background elements */}
            <View style={styles.backgroundContainer} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity
                                style={styles.goBackButton}
                                onPress={() => router.replace('/(tabs)/viewPackages')}
                            >
                                <FontAwesome5 name='chevron-left' size={20} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Nuevo Paquete</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.logOutButton} onPress={handleSignOut}>
                                <Text style={styles.logOutText}>Salir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formContainer}>
                        {/* Description */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputWithIcon}>
                                <FontAwesome name="comment" size={16} color="#D97706" style={styles.icon} />
                                <TextInput
                                    placeholder="Descripción del paquete"
                                    placeholderTextColor="#999"
                                    value={description}
                                    onChangeText={setDescription}
                                    style={styles.textInput}
                                    multiline
                                />
                            </View>
                        </View>

                        {/* Prices */}
                        <View style={styles.priceRow}>
                            <View style={[styles.inputContainer, styles.priceInputContainer]}>
                                <View style={styles.inputWithIcon}>
                                    <FontAwesome5 name="dollar-sign" size={16} color="#D97706" style={styles.icon} />
                                    <TextInput
                                        placeholder="PVP Normal"
                                        placeholderTextColor="#999"
                                        value={price}
                                        onChangeText={setPrice}
                                        keyboardType="numeric"
                                        style={styles.textInput}
                                        multiline={true}

                                    />
                                </View>
                            </View>

                            <View style={[styles.inputContainer, styles.priceInputContainer]}>
                                <View style={styles.inputWithIcon}>
                                    <FontAwesome5 name="tags" size={16} color="#D97706" style={styles.icon} />
                                    <TextInput
                                        placeholder="PVP Actual"
                                        placeholderTextColor="#999"
                                        value={discountedPrice}
                                        onChangeText={setDiscountedPrice}
                                        keyboardType="numeric"
                                        style={styles.textInput}
                                        multiline={true}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Units */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputWithIcon}>
                                <FontAwesome name="hashtag" size={16} color="#D97706" style={styles.icon} />
                                <TextInput
                                    placeholder="Unidades disponibles"
                                    placeholderTextColor="#999"
                                    value={units}
                                    onChangeText={setUnits}
                                    keyboardType="numeric"
                                    style={styles.textInput}
                                />
                            </View>
                        </View>

                        {/* Pickup Time */}
                        <Text style={styles.sectionTitle}>Hora límite de retiro</Text>
                        <View style={styles.timeInputContainer}>
                            <TextInput
                                placeholder="HH"
                                placeholderTextColor="#999"
                                value={pickupTimeHour}
                                onChangeText={setPickupTimeHour}
                                style={styles.timeInput}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            <Text style={styles.timeSeparator}>:</Text>
                            <TextInput
                                placeholder="MM"
                                placeholderTextColor="#999"
                                value={pickupTimeMin}
                                onChangeText={setPickupTimeMin}
                                style={styles.timeInput}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                        </View>

                        {/* Icon Selection */}
                        <Text style={styles.sectionTitle}>Icono del paquete</Text>
                        <Text style={styles.sectionSubtitle}>
                            Selecciona una imagen representativa
                        </Text>
                        <View style={styles.iconGrid}>
                            {iconOptions.map((icon) => (
                                <TouchableOpacity
                                    key={icon}
                                    onPress={() => setSelectedIcon(icon)}
                                    style={[
                                        styles.iconButton,
                                        selectedIcon === icon && styles.selectedIconButton
                                    ]}
                                >
                                    <FontAwesome5
                                        name={icon as any}
                                        size={30}
                                        color={selectedIcon === icon ? '#fff' : '#C2410C'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            style={styles.submitButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.submitButtonText}>Crear Paquete</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFBEB', // Cream background
    },
    backgroundContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '30%', // Orange top section
        backgroundColor: '#C2410C',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingTop: 50,
        paddingBottom: 20,
        zIndex: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        marginLeft: 15,
    },
    logOutButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    logOutText: {
        color: 'white',
        fontWeight: '600',
    },
    goBackButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 10,
        borderRadius: 20,
    },
    formContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginHorizontal: 20,
        padding: 25,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C2410C',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    inputContainer: {
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EDE9E3',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 12,
        color: '#333',
        fontSize: 16,
        minHeight: 24,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    priceInputContainer: {
        width: '48%',
    },
    timeInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    timeInput: {
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#EDE9E3',
        width: 80,
        textAlign: 'center',
    },
    timeSeparator: {
        fontSize: 18,
        color: '#C2410C',
        fontWeight: 'bold',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 25,
        alignContent: 'center',
        alignItems: 'center',
    },
    iconButton: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: '#FFFBEB',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#EDE9E3',
    },
    selectedIconButton: {
        backgroundColor: '#E74C3C',
        borderColor: '#C2410C',
    },
    submitButton: {
        backgroundColor: '#E74C3C',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    icon: {
        color: '#D97706',
        marginRight: 10,
    },
});