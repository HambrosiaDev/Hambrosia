import { useState } from 'react';
import { Image, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable, View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions } from "react-native";


const roles = ["Usuario", "Restaurante"];
const { width } = Dimensions.get("window");


export default function Register() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState("Usuario");
  const [modalVisible, setModalVisible] = useState(false);

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
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="envelope" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor="gray"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="lock" size={18} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor="gray"
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="lock" size={18} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar Contraseña"
                    placeholderTextColor="gray"
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="map-marker" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ciudad ej. Quito"
                    placeholderTextColor="gray"
                  />
                </View>

                <View style={styles.dateContainer}>
                 <View style={styles.date}>
                  <FontAwesome name="calendar" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Día"
                    placeholderTextColor="gray"
                  />
                 </View>
                 <View style={styles.date}>
                 <FontAwesome name="calendar" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mes"
                    placeholderTextColor="gray"
                  />
                 </View>
                 <View style={styles.date}>
                 <FontAwesome name="calendar" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Año"
                    placeholderTextColor="gray"
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
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="envelope" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor="gray"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="id-badge" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="RUC"
                    placeholderTextColor="gray"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="lock" size={18} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor="gray"
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="lock" size={18} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar Contraseña"
                    placeholderTextColor="gray"
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome name="map-marker" size={16} color="gray" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Dirección"
                    placeholderTextColor="gray"
                  />
                </View>
              </>
            )}
            <Text style={styles.title}>He leído y acepto los términos y condiciones</Text>
          </View>



          {/* Botón Registrarme */}
          <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={() => router.navigate("/(tabs)")}>
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
    bottom:30,
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
  date:{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5c6b0',
    paddingHorizontal: 10,
    borderRadius: 8,
    width: '31%',
    height: 45,
    marginBottom: 35,
    
  },
  dateContainer:{
    flexDirection:"row",
    alignContent: 'center',
    gap:10,
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
});
