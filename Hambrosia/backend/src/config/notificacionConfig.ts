import admin from "./firebase";

interface NotificationPayload {
  token: string;
  title: string;
  body: string;
  data?: { [key: string]: string };
}

export const sendPushNotification = async ({
  token,
  title,
  body,
  data,
}: NotificationPayload) => {
  try {
    const message: admin.messaging.Message = {
      token,
      notification: {
        title,
        body,
      },
      data,
      android: {
        priority: "high",
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("✅ Notificación enviada con éxito:", response);
    return response;
  } catch (error) {
    console.error("❌ Error al enviar notificación:", error);
    throw error;
  }
};
