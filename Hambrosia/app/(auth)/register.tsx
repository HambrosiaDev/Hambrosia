import { useState } from 'react';
import { Image, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable, View, Text, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import React from 'react';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions } from "react-native";
import Checkbox from 'expo-checkbox';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from "@/app/firebaseConfig";
import { validarIdentificacionEcuatoriana, TipoIdentificacionEnum } from "@/components/testId";


const roles = ["Cliente", "Restaurante"];
const { width } = Dimensions.get("window");


export default function Register() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState("Cliente");
  const [modalVisible, setModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    user: {
      name: "",
      cedula: "",
      email: "",
      password: "",
      confirmPassword: "",
      city: "",
      day: "",
      month: "",
      year: "",
    },
    restaurant: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      ruc: "",
      location: "",
      city: ""
    },
  });

  const handleChange = (section: "user" | "restaurant", key: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [key]: value,
      },
    }));
  };

  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((item) => item !== allergen)
        : [...prev, allergen]
    );
  };

  const allergensList = [
    'Crustáceos/Mariscos', 'Pescado', 'Leche', 'Huevo', 'Frutos Secos',
    'Maní/Cacahuate', 'Trigo', 'Granos de Soya', 'Sésamo'
  ];


  const validateDate = (day: string, month: string, year: string): boolean => {
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (isNaN(dayNum)) return false;
    if (isNaN(monthNum)) return false;
    if (isNaN(yearNum)) return false;

    if (monthNum < 1 || monthNum > 12) return false;
    if (dayNum < 1 || dayNum > 31) return false;

    if ([4, 6, 9, 11].includes(monthNum) && dayNum > 30) return false;

    if (monthNum === 2) {
      const isLeapYear = (yearNum % 4 === 0 && yearNum % 100 !== 0) || yearNum % 400 === 0;
      if (dayNum > (isLeapYear ? 29 : 28)) return false;
    }

    const currentDate = new Date();
    const inputDate = new Date(yearNum, monthNum - 1, dayNum);
    return inputDate < currentDate;
  }



  const setToNull = () => {
    setFormData((prevData) => ({
      ...prevData,
      user: {
        name: "",
        cedula: "",
        email: "",
        password: "",
        confirmPassword: "",
        city: "",
        day: "",
        month: "",
        year: "",
      }, restaurant: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        ruc: "",
        location: "",
        city: ""
      },
    }));
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string, confirmPassword: string): boolean => {
    const errors = [];

    if (password.length < 8) errors.push("Debe tener al menos 8 caracteres.");
    if (!/[A-Z]/.test(password)) errors.push("Debe tener al menos 1 mayúscula.");
    if (!/[a-z]/.test(password)) errors.push("Debe tener al menos 1 minúscula.");
    if (!/[0-9]/.test(password)) errors.push("Debe tener al menos 1 número.");
    if (!/[\W_]/.test(password)) errors.push("Debe tener al menos 1 caracter especial.");
    if (password !== confirmPassword) errors.push("Las contraseñas no coinciden.");

    if (errors.length > 0) {
      Alert.alert("Error de contraseña", errors.join("\n"));
      return false;
    }
    return true;
  };



  const validateData = () => {
    if (selectedRole === "Cliente") {
      if (!formData.user.name.trim()) {
        Alert.alert("Error", "Por favor ingrese su nombre completo");
        return false;
      }

      const cedulaValidation = validarIdentificacionEcuatoriana(formData.user.cedula);
      if (!cedulaValidation.isValid || cedulaValidation.type !== TipoIdentificacionEnum.CEDULA) {
        Alert.alert("Error", "Cédula inválida");
        return false;
      }

      if (!validateEmail(formData.user.email)) {
        Alert.alert("Error", "Formato de correo inválido");
        return false;
      }

      if (!validatePassword(formData.user.password, formData.user.confirmPassword)) {
        return false;
      }

      if (!formData.user.city.trim()) {
        Alert.alert("Error", "Por favor ingrese su ciudad");
        return false;
      }

      if (!validateDate(formData.user.day, formData.user.month, formData.user.year)) {
        Alert.alert("Error", "Fecha de nacimiento inválida");
        return false;
      }

    } else if (selectedRole === "Restaurante") {
      /*const rucValidation = validarIdentificacionEcuatoriana(formData.restaurant.ruc);
      if (!rucValidation.isValid ||
        (rucValidation.type !== TipoIdentificacionEnum.RUC_SOCIEDAD_PRIVADA &&
          rucValidation.type !== TipoIdentificacionEnum.RUC_SOCIEDAD_PUBLICA)) {
        Alert.alert("Error", "RUC inválido");
        return false;
      }*/

      if (!formData.restaurant.name.trim()) {
        Alert.alert("Error", "Por favor ingrese el nombre del restaurante");
        return false;
      }



      if (!validateEmail(formData.restaurant.email)) {
        Alert.alert("Error", "Formato de correo inválido");
        return false;
      }

      if (!validatePassword(formData.restaurant.password, formData.restaurant.confirmPassword)) {
        return false;
      }

      if (!formData.restaurant.city.trim()) {
        Alert.alert("Error", "Por favor ingrese la ciudad");
        return false;
      }
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateData()) return;

    try {
      const isRestaurant = selectedRole === "Restaurante";
      const userData = isRestaurant ? formData.restaurant : formData.user;

      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      const payload = {
        rol: selectedRole.toUpperCase(),
        firebaseUid: user.uid,
        correo: userData.email,
        ...(isRestaurant
          ? {
            cedulaRUC: formData.restaurant.ruc,
            ciudad: formData.restaurant.city.toUpperCase(),
            direccion: formData.restaurant.location,
            nombre: formData.restaurant.name,
            alergenos: selectedAllergens.map(a =>
              a.normalize("NFD")
               .replace(/[\u0300-\u036f]/g, "")  
               .replace(/[\s\/]/g, '_')          
               .toUpperCase()
            )      
          }
          : {
            cedulaRUC: formData.user.cedula,
            ciudad: formData.user.city.toUpperCase(),
            fechaNacimiento: `${formData.user.day}-${formData.user.month}-${formData.user.year}`,
            nombre: formData.user.name
          }),
      };

      const response = await fetch("https://hambrosia.onrender.com/api/usuarios/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend registration failed: ${response.status} - ${errorText}`);
      }

      Alert.alert("Éxito", "Registro completado correctamente 🎉");
      setToNull();
      router.replace("/");

    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert("Error", `Registro fallido: ${error.message}`);
    }
  };


  const testConnection = async () => {
    try {
      const test = await fetch('https://hambrosia.onrender.com/api/usuarios');
      console.log('Connection test:', await test.json());
    } catch (e) {
      console.log('Connection completely broken:', e);
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Header Image */}
        <Image
          source={{
            uri: 'https://studyadelaide.com/storage/app/media/life/discover-adelaide/food/food-1300x1300.jpg',
          }}
          style={styles.headerImage}
        />

        {/* Formulario */}
        <View style={styles.formContainer}>
          <Image source={require('@/assets/images/Logo-2-orange.png')} style={styles.logo_1} />

          <Text style={styles.title}>Seleccione</Text>
          <View style={{ width: '100%', alignItems: 'center', display: "flex", flexDirection: "row" }}>
            <View style={styles.roleSelectorContainer}>
              <TouchableOpacity
                style={styles.roleSelectorButton}
                onPress={() => setModalVisible(true)}
              >
                <View style={styles.roleSelectorContent}>
                  <FontAwesome5
                    name="user-tag"
                    size={16}
                    color="#C2410C"
                    style={styles.roleIcon}
                  />
                  <Text style={styles.roleSelectorText}>
                    {selectedRole}
                  </Text>
                  <FontAwesome5
                    name="chevron-down"
                    size={14}
                    color="#6B7280"
                    style={styles.chevronIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Modal con la lista de opciones */}
            <Modal visible={modalVisible} transparent animationType="fade">
              <TouchableOpacity
                style={styles.modalOverlay}
                onPress={() => setModalVisible(false)}
                activeOpacity={1}
              >
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Selecciona un rol para tu cuenta</Text>
                  <FlatList
                    data={roles}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          setSelectedRole(item);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{item}</Text>
                        {selectedRole === item && (
                          <FontAwesome name="check" size={16} color="#D97706" />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
          {/* Input */}
          <View style={{ width: '100%' }}>
            {selectedRole === "Cliente" ? (
              <>
                <View style={styles.inputContainer}>
                  <FontAwesome name="user" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre completo"
                    placeholderTextColor="gray"
                    value={formData.user.name}
                    onChangeText={(text) => handleChange("user", "name", text)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="id-badge" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Cédula"
                    placeholderTextColor="gray"
                    value={formData.user.cedula}
                    onChangeText={(text) => handleChange("user", "cedula", text)}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="envelope" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor="gray"
                    value={formData.user.email}
                    onChangeText={(text) => handleChange("user", "email", text)}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="lock" size={18} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor="gray"
                    value={formData.user.password}
                    onChangeText={(text) => handleChange("user", "password", text)}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="lock" size={18} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar Contraseña"
                    placeholderTextColor="gray"
                    value={formData.user.confirmPassword}
                    onChangeText={(text) => handleChange("user", "confirmPassword", text)}
                    secureTextEntry
                  />
                </View>

                <Text style={styles.title}>La contraseña debe tener al menos un número, minúscula, mayúscula y caracter especial</Text>

                <View style={styles.inputContainer}>
                  <FontAwesome name="map-marker" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ciudad ej. Quito"
                    placeholderTextColor="gray"
                    value={formData.user.city}
                    onChangeText={(text) => handleChange("user", "city", text)}
                  />
                </View>

                <View style={styles.dateContainer}>
                  <View style={styles.date}>
                    <FontAwesome name="calendar" size={16} color="gray" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Día"
                      placeholderTextColor="gray"
                      value={formData.user.day}
                      onChangeText={(text) => handleChange("user", "day", text)}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                  <View style={styles.date}>
                    <FontAwesome name="calendar" size={16} color="gray" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Mes"
                      placeholderTextColor="gray"
                      value={formData.user.month}
                      onChangeText={(text) => handleChange("user", "month", text)}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                  <View style={styles.date}>
                    <FontAwesome name="calendar" size={16} color="gray" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Año"
                      placeholderTextColor="gray"
                      value={formData.user.year}
                      onChangeText={(text) => handleChange("user", "year", text)}
                      keyboardType="numeric"
                      maxLength={4}
                    />
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <FontAwesome name="user" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre del restaurante"
                    placeholderTextColor="gray"
                    value={formData.restaurant.name}
                    onChangeText={(text) => handleChange("restaurant", "name", text)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="envelope" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor="gray"
                    value={formData.restaurant.email}
                    onChangeText={(text) => handleChange("restaurant", "email", text)}
                    autoCapitalize="none"
                    keyboardType='email-address'

                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="id-badge" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="RUC"
                    placeholderTextColor="gray"
                    value={formData.restaurant.ruc}
                    onChangeText={(text) => handleChange("restaurant", "ruc", text)}
                    keyboardType="numeric"
                    maxLength={13}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="lock" size={18} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor="gray"
                    value={formData.restaurant.password}
                    onChangeText={(text) => handleChange("restaurant", "password", text)}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="lock" size={18} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar Contraseña"
                    placeholderTextColor="gray"
                    value={formData.restaurant.confirmPassword}
                    onChangeText={(text) => handleChange("restaurant", "confirmPassword", text)}
                    secureTextEntry
                  />
                </View>
                <Text style={styles.title}>La contraseña debe tener al menos un número, minúscula, mayúscula y caracter especial</Text>
                <View style={styles.inputContainer}>
                  <FontAwesome name="map" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Dirección"
                    placeholderTextColor="gray"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="map-marker" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ciudad ej. Quito"
                    placeholderTextColor="gray"
                    value={formData.restaurant.city}
                    onChangeText={(text) => handleChange("restaurant", "city", text)}
                  />
                </View>

                <View style={styles.containerAllergens}>
                  <Text style={styles.titleAllergens}>Selecciona los alérgenos que podrían estar presentes en tus paquetes</Text>
                  <View style={styles.allergenList}>
                    {allergensList.map((allergen) => (
                      <View key={allergen} style={styles.allergenItem}>
                        <Checkbox
                          value={selectedAllergens.includes(allergen)}
                          onValueChange={() => toggleAllergen(allergen)}
                          color={selectedAllergens.includes(allergen) ? '#E74C3C' : undefined}
                          />

                        <Text style={styles.allergenText}>{allergen}</Text>
                      </View>
                    ))}
                  </View>
                </View>


              </>
            )}
            <Text style={styles.title}>He leído y acepto los términos y condiciones</Text>
          </View>



          {/* Botón Registrarme */}
          <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={() => handleRegister()}>
            <Text style={styles.buttonText}>Registrarme</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>

  );
}

const styles = StyleSheet.create({
  title: {
    alignSelf: "flex-start",
    color: '#7F8C8D',
    fontSize: 14,
    fontStyle: 'italic',
    bottom: 7
  },
  container: {
    flex: 1,
    backgroundColor: '#f7ccbe',
  },
  roleSelectorContainer: {
    width: '100%',
    marginBottom: 15,
  },
  roleSelectorButton: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    paddingVertical: 10,
  },
  roleSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  roleIcon: {
    marginRight: 12,
  },
  roleSelectorText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  chevronIcon: {
    marginLeft: 12,
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
    flexGrow: 1,
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: 60,
    opacity: 0.8,
    backgroundColor: '#DF4E00'
  },
  logo_1: {
    width: width * 0.15,
    height: width * 0.15,
    resizeMode: "contain",
    alignSelf: "center",
    bottom: 30,
    marginBottom: 20,
  },
  logoContainer: {
    position: 'absolute',
    top: 0,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center"
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  formContainer: {
    width: '85%',
    marginTop: 40,
    backgroundColor: '#f7ccbe',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    borderRadius: 8,
    width: '100%',
    height: 45,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  date: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    borderRadius: 8,
    width: '31%',
    height: 45,

  },
  dateContainer: {
    flexDirection: "row",
    alignContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    backgroundColor: '#CE2C04',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  containerAllergens: {
    padding: 1,
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  titleAllergens: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  allergenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  allergenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 8,
    margin: 5,
  },
  allergenText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
});
