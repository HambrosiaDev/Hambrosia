import { Image, StyleSheet, View, TextInput, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import React, { useState, useEffect, useRef  } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions } from "react-native";
import Loading from '@/components/Loading';


import { auth } from "@/app/firebaseConfig";
import { signInWithEmailAndPassword } from 'firebase/auth';
import {FirebaseError} from "firebase/app"


const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const router = useRouter();
  const translation = useRef(new Animated.Value(0)).current;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Sign in failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(()=>{
    Animated.timing(translation, {
      toValue: -100,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [])

 useEffect(() => {
    setTimeout(() => {
      setLoadingPage(false);
    }, 3000);
  }, []);
if(loadingPage) return <Loading />

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
        <Animated.View style={[styles.logoContainer, { transform: [{ translateY: translation }] }]}>
        <Image source={require('@/assets/images/Logo-2.png')} style={styles.logo_1}/>
          <Text style={styles.logo}>HAMBROSÍA</Text>
        </Animated.View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          {/* Input de correo */}
          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" size={16} color="gray" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Correo electrónico" placeholderTextColor="gray" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          </View>

          {/* Input de contraseña */}
          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={18} color="gray" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="gray"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none" 
            />
          </View>

          {/* Botón Ingresar */}
          <TouchableOpacity style={styles.button} onPress={signIn} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Ingresando' : 'Ingresar'}</Text>
          </TouchableOpacity>

          {/* Botón Registrarme */}
          <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={()=>router.navigate("/(auth)/register")} >
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
    backgroundColor: '#C2410C'
  },
  logo_1: {
    width: width * 0.35,
    height: width * 0.35,
    resizeMode: "contain",
    bottom: 10
  },
  logoContainer: {
    position: 'absolute',
    top: 180,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#FFF7ED', 
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
    marginBottom: 15,

  },
  icon: {
    marginRight: 10,
    color: '#6B7280' 
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937', // Dark text from ViewPackages
  },
  button: {
    width: '100%',
    backgroundColor: '#CE2C04', // Red from ViewPackages
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: '#B91C1C', // Darker red from ViewPackages currentPrice
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    marginTop: 10,
    color: '#6B7280', // Gray from ViewPackages
    fontSize: 14,
    fontStyle: 'italic',
  },
});