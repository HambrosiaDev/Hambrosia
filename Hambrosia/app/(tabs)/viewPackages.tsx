import { useState } from 'react';
import { Image, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable, View, Text, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions } from "react-native";
import Checkbox from 'expo-checkbox';



const roles = ["Usuario", "Restaurante"];
const { width } = Dimensions.get("window");


export default function Register() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState("Usuario");
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

  const [selectedAllergens, setSelectedAllergens] = useState<Record<string, boolean>>({});
  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) => ({
      ...prev,
      [allergen]: !prev[allergen],
    }));
  };
  const allergensList = [
    'Crustáceos/Mariscos', 'Pescado', 'Leche', 'Huevo', 'Frutos Secos', 
    'Maní/Cacahuate', 'Trigo', 'Granos de Soya', 'Sésamo'
  ];

  const confirmPassword = (pass1: string, pass2: string): boolean => {
    if (pass1.length < 8) {
      Alert.alert("La contraseña debe tener al menos 8 caracteres.");
      return false;
    }
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
    
    return true;
  };

  const validateEmail = (email: string): boolean =>{
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)){
      Alert.alert("Formato de correo inválido")
      return false;
    } else{
      return true;
    }
  }


  const handleRegister = () => {
    if(selectedRole == "Restaurante"){
      confirmPassword(formData.restaurant.password, formData.restaurant.password);
    }else{
      console.log(formData.user.name);
      console.log(formData.user.email);
      console.log(formData.user.password);
      console.log(formData.user.confirmPassword);
      console.log(formData.user.city);
      console.log(formData.user.day);
      console.log(formData.user.month);
      console.log(formData.user.year);
      confirmPassword(formData.user.password, formData.user.confirmPassword)
      setFormData((prevData) => ({
        ...prevData,
        user: {
          name: "",
          cedula:"",
          email: "",
          password: "",
          confirmPassword: "",
          city: "",
          day: "",
          month: "",
          year: "",
        },
      }));
      
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
          <View style={{ width: '100%', alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#f5c6b0',
                padding: 10,
                borderRadius: 8,
                bottom: 10,
                width: '100%',
                height: 45,
                justifyContent: 'center'
              }}
              onPress={() => setModalVisible(true)}
            >
              <Text style={{ color: 'black', fontSize: 16 }}>{selectedRole}</Text>
            </TouchableOpacity>

            {/* Modal con la lista de opciones */}
            <Modal visible={modalVisible} transparent animationType="fade">
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
                onPress={() => setModalVisible(false)}
              >
                <View style={{ backgroundColor: 'white', padding: 10, borderRadius: 8, width: '85%' }}>
                  <FlatList
                    data={roles}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' }}
                        onPress={() => {
                          setSelectedRole(item);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
          {/* Input */}
          <View style={{ width: '100%' }}>
            {selectedRole === "Usuario" ? (
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
                  <FontAwesome name="map-marker" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Dirección"
                    placeholderTextColor="gray"
                  />
                </View>

                <View style={styles.containerAllergens}>
                      <Text style={styles.titleAllergens}>Selecciona los alérgenos que podrían estar presentes en tus paquetes</Text>
                      <View style={styles.allergenList}>
                        {allergensList.map((allergen) => (
                          <View key={allergen} style={styles.allergenItem}>
                            <Checkbox
                              value={selectedAllergens[allergen] || false}
                              onValueChange={() => toggleAllergen(allergen)}
                              color={selectedAllergens[allergen] ? '#E74C3C' : undefined}
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
    backgroundColor: '#f5c6b0',
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
    backgroundColor: '#f5c6b0',
    paddingHorizontal: 10,
    borderRadius: 8,
    width: '31%',
    height: 45,
    marginBottom: 35,

  },
  dateContainer: {
    flexDirection: "row",
    alignContent: 'center',
    gap: 10,
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
  forgotPassword: {
    marginTop: 10,
    color: '#7F8C8D',
    fontSize: 14,
    fontStyle: 'italic',
  },
  containerAllergens: {
    padding: 1,
    alignItems: 'center',
    borderRadius: 10,
  },
  titleAllergens: {
    marginTop:10,
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
    backgroundColor: '#f5c6b0',
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
