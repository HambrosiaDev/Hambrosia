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
    const [normalPrice, setNormalPrice] = useState('');
    const [units, setUnits] = useState('');
    const [pickupTime, setPickupTime] = useState('');
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
    const router = useRouter();

    const handleSignOut = () => auth.signOut();

    const handleSubmit = () => {
        if (!description || !price || !units || !pickupTime || !selectedIcon) {
            Alert.alert('Campos incompletos', 'Por favor completa todos los campos');
            return;
        }

        const newPackage = {
            description,
            price: Number(price),
            normalPrice: Number(normalPrice),
            units: Number(units),
            pickupTime: pickupTime,
            imageIcon: selectedIcon,
        };

        console.log('Package to submit:', newPackage);
        Alert.alert('Éxito', 'El paquete fue creado correctamente');
        navigation.goBack();
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
                                        placeholder="Descuento"
                                        placeholderTextColor="#999"
                                        value={normalPrice}
                                        onChangeText={setNormalPrice}
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

                        <View style={styles.inputGroup}>
                            <View style={styles.inputWithIcon}>
                                <FontAwesome name="clock-o" size={16} color="#D97706" />
                                <TextInput
                                    placeholder="Hora límite (ej: 21:00)"
                                    placeholderTextColor="#999"
                                    value={pickupTime}
                                    onChangeText={setPickupTime}
                                    style={styles.textInput}
                                />
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