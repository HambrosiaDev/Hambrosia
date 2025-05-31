import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function notifications() {
  if (!Device.isDevice) {
    alert('Debes usar un dispositivo físico para recibir notificaciones push');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('No se otorgaron permisos para notificaciones push');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Expo Push Token:', token);
  return token;
}

export async function deleteExpoToken(cedRuc: string) {
  try {
      console.log("cedulaaaa "+cedRuc)
        const payload = {
          expoPushToken: "."
        };
        const response = await fetch(`https://hambrosia.onrender.com/api/usuarios/update-expo-push-token/${cedRuc}`, {
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
}
