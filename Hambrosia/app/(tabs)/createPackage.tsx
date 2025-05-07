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


    const handleSignOut = () => auth.signOut();

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
        validateData();
        const payload = {
            descripcion: description,
            precioDescuento: Number(discountedPrice),
            precio: Number(price),
            unidades: Number(units),
            horaRetiro: pickupTimeHour+":"+pickupTimeMin,
            imagenURL: selectedIcon,
        };
       try {
            const payload = {
                descripcion: description,
                precioDescuento: Number(discountedPrice),
                precio: Number(price),
                unidades: Number(units),
                horaRetiro: pickupTimeHour+":"+pickupTimeMin,
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
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={{
                    backgroundColor: '#f7ccbe',
                    flexGrow: 1,
                    paddingBottom: 30
                }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.title}>HAMBROSÍA</Text>
                            <FontAwesome5 name="utensils" size={24} color="#D97706" style={styles.icon} />
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity
                                style={styles.goBackButton}
                                onPress={() => router.replace('/(tabs)/viewPackages')}
                            >
                                <FontAwesome5 name='chevron-left' size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.logOutButton} onPress={handleSignOut}>
                                <Text style={styles.logOutText}>Salir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <FontAwesome name="comment" size={16} color="#D97706" style={styles.icon} />
                            <TextInput
                                placeholder="Describe el paquete, ej: algo refrescante y saludable"
                                placeholderTextColor="#999"
                                value={description}
                                onChangeText={setDescription}
                                style={styles.textInput}
                                multiline
                            />
                        </View>

                        <View style={styles.priceRow}>
                            <View style={styles.priceInputContainer}>
                                <View style={styles.inputWithIcon}>
                                    <FontAwesome5 name="dollar-sign" size={16} color="#D97706" />
                                    <TextInput
                                        placeholder="Precio"
                                        placeholderTextColor="#999"
                                        value={price}
                                        onChangeText={setPrice}
                                        keyboardType="numeric"
                                        style={styles.priceInput}
                                    />
                                </View>
                            </View>

                            <View style={styles.priceInputContainer}>
                                <View style={styles.inputWithIcon}>
                                    <FontAwesome5 name="dollar-sign" size={16} color="#D97706" />
                                    <TextInput
                                        placeholder="Precio con descuento"
                                        placeholderTextColor="#999"
                                        value={discountedPrice}
                                        onChangeText={setDiscountedPrice}
                                        keyboardType="numeric"
                                        style={styles.priceInput}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputWithIcon}>
                                <FontAwesome name="hashtag" size={16} color="#D97706" />
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

                        <Text style={styles.sectionTitle}>Hora límite del retiro</Text>
                        <View style={styles.priceRow}>
                            <View style={styles.priceInputContainer}>
                                <View style={styles.inputWithIcon}>
                                <FontAwesome name="clock-o" size={16} color="#D97706" />
                                <TextInput
                                    placeholder="HH"
                                    placeholderTextColor="#999"
                                    value={pickupTimeHour}
                                    onChangeText={setPickupTimeHour}
                                    style={styles.textInput}
                                    keyboardType="numeric"
                                />
                                </View>
                            </View>

                            <Text style={styles.sectionTitle}>:</Text>

                            <View style={styles.priceInputContainer}>
                                <View style={styles.inputWithIcon}>
                                <FontAwesome name="clock-o" size={16} color="#D97706" />
                                <TextInput
                                    placeholder="MM"
                                    placeholderTextColor="#999"
                                    value={pickupTimeMin}
                                    onChangeText={setPickupTimeMin}
                                    style={styles.textInput}
                                    keyboardType="numeric"
                                />
                                </View>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Icono del paquete</Text>
                        <Text style={styles.sectionSubtitle}>
                            Escoge la imagen que mejor represente el paquete
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
                                        size={35}
                                        color={selectedIcon === icon ? '#fff' : '#D97706'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            style={styles.submitButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.submitButtonText}>Crear Paquete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7ccbe',
        paddingTop: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
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
    },
    logOutText: {
        color: 'white',
        fontWeight: '600',
    },
    icon: {
        marginTop: 4,
    },
    goBackButton: {
        backgroundColor: '#D97706',
        padding: 8,
        borderRadius: 20,
    },
    formContainer: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C2410C',
        marginBottom: 10,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#C2410C',
        marginBottom: 5,
    },
    inputContainer: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 10,
        color: '#333',
        fontSize: 16,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    priceInputContainer: {
        width: '48%',
    },
    priceInput: {
        flex: 1,
        paddingHorizontal: 10,
        color: '#333',
        fontSize: 16,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 25,
    },
    iconButton: {
        width: 70,
        height: 70,
        backgroundColor: '#FFFBEB',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedIconButton: {
        backgroundColor: '#F26D21',
    },
    submitButton: {
        backgroundColor: '#F26D21',
        padding: 16,
        borderRadius: 10,
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
});