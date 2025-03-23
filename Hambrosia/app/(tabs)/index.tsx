import { Image, StyleSheet, View, TextInput, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';

export default function HomeScreen() {
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

        {/* Logo y Nombre */}
        <View style={styles.logoContainer}>
          <Image source={require('@/assets/images/Logo-2.png')} style={styles.logo_1}/>
          <Text style={styles.logo}>HAMBROSÍA</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          {/* Input de correo */}
          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" size={16} color="gray" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Correo electrónico" placeholderTextColor="gray" />
          </View>

          {/* Input de contraseña */}
          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={18} color="gray" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="gray"
              secureTextEntry
            />
          </View>

          {/* Botón Ingresar */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Ingresar</Text>
          </TouchableOpacity>

          {/* Botón Registrarme */}
          <TouchableOpacity style={[styles.button, styles.registerButton]}>
            <Text style={styles.buttonText}>Registrarme</Text>
          </TouchableOpacity>

          {/* Enlace de Olvidaste tu contraseña */}
          <Text style={styles.forgotPassword}>¿Has olvidado tu contraseña?</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    height: 350,
    opacity: 0.8,
    backgroundColor: '#DF4E00'
  },
  logo_1: {
    width: '30%',
    height: '250%',
  },
  logoContainer: {
    position: 'absolute',
    top: 160,
    paddingVertical: 10,
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
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'black',
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
