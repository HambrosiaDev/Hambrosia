import { Image, StyleSheet, View, TextInput, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions } from "react-native";
import Loading from '@/components/Loading';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { auth, firestore } from "@/app/firebaseConfig";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from "firebase/firestore";
import { useUserStore } from '../user';
import { notifications } from '../notifications';


const { width } = Dimensions.get("window");





export default function HomeScreen() {
  const [user, setUser] = useState<import('firebase/auth').User | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const router = useRouter();
  const translation = useRef(new Animated.Value(0)).current;


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const signIn = async () => {
    setLoading(true);
    setLoadingPage(true);
    try {
      if (email === "" || password === "") {
        alert("Por favor, completa todos los campos.");
        return;
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password); //Ingresar a F. Authenticator
      const user = userCredential.user; //Guardar datos del usuario
      const token = await user.getIdToken(); //Obtener token del usuario
      console.log("Token:", token); //Imprimir token en consola
      console.log("User signed in:", user.uid);

      const usuariosQuery = query( //Busqueda en la colección con el usuario ingresado
        collection(firestore, "usuarios"),
        where("firebaseUid", "==", user.uid)
      );
      const querySnapshot = await getDocs(usuariosQuery);

      const pushToken = await notifications();

      console.log("Push token" + pushToken);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        useUserStore.getState().setRole(userData.rol); //guardar en user.ts
        useUserStore.getState().setCedRuc(userData.cedulaRUC);
        useUserStore.getState().setCiudad(userData.ciudad);
        console.log("User data from Firestore:", userData);

        try {
          const payload = {
            expoPushToken: pushToken
          };
          console.log("cedula registrada: " + userData.cedulaRUC);
          const response = await fetch(`https://hambrosia.onrender.com/api/usuarios/update-expo-push-token/${userData.cedulaRUC}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Token registration failed: ${response.status} - ${errorText}`);
          }
        } catch (e: any) {
          console.log("Error al actualizar el token: " + e.message);
        }


      } else {
        console.log("No user data found in Firestore for UID:", user.uid);

      }
      setEmail("");
      setPassword("");

    } catch (e: any) {
      alert("Ingreso fallido" + e.message);
      try {
        const payload = {
          correo: email
        }
        const response = await fetch("https://hambrosia.onrender.com/api/usuarios/login/intentoFallido", { //Strike por intento fallido
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Strikes failed: ${response.status} - ${errorText}`);
        }
      } catch (e: any) {
        console.log("Error" + e)
      }

    } finally {
      setLoading(false);
      setLoadingPage(false);
    }
  };



  useEffect(() => {
    const fetchStoredUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };
    fetchStoredUser();
  }, []);


  useEffect(() => {
    setTimeout(() => {
      setLoadingPage(false);
    }, 3000);
  }, []);
  if (loadingPage) return <Loading />



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
          <Image source={require('@/assets/images/Logo-2.png')} style={styles.logo_1} />
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
          <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={() => router.navigate("/(auth)/register")} >
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
    top: 110,
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
    color: '#1F2937',
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
    backgroundColor: '#B91C1C',
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