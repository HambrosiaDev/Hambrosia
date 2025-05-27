import nodemailer from 'nodemailer';

// Configuración del transportador de correo
const emailConfig = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'tu-correo@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'tu-contraseña-de-aplicacion', // Contraseña de aplicación de Google
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verificar la conexión
emailConfig.verify((error, success) => {
    if (error) {
        console.error('Error en la configuración del correo:', error);
    } else {
        console.log('Servidor listo para enviar correos');
    }
});


// Función helper para enviar correos
export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
    try {
        await emailConfig.sendMail({
            from: process.env.EMAIL_USER || 'tu-correo@gmail.com',
            to,
            subject,
            html
        });
        console.log('Correo enviado exitosamente');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('Error al enviar el correo electrónico');
    }
};

export default emailConfig; 