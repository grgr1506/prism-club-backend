const nodemailer = require('nodemailer');
require('dotenv').config();

// --- CONFIGURACIÓN MANUAL "ANTIBLOQUEO" ---
const transporter = nodemailer.createTransport({
    host: 'smtp.googlemail.com', // <--- CAMBIO CLAVE: Usamos este alias
    port: 587,                   // <--- Puerto estándar STARTTLS
    secure: false,               // <--- False para el puerto 587
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Ayuda si hay proxies intermedios
    },
    family: 4 // <--- OBLIGATORIO: Fuerza IPv4 en Render
});

// Verificación de conexión (para debug)
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error verificando conexión SMTP:', error);
    } else {
        console.log('✅ Servidor de Correos conectado correctamente a ' + transporter.options.host);
    }
});

module.exports = (formulario) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
        from: `"Prism Club Contacto" <${process.env.GMAIL_USER}>`,
        to: formulario.correo_electronico,
        subject: 'Gracias por contactarnos',
        html: `
            <h2>Hola ${formulario.nombre}!</h2>
            <p>Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.</p>
            <hr>
            <strong>Tu mensaje:</strong> ${formulario.mensaje}
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('❌ Error enviando:', err);
            reject(err);
        } else {
            console.log('✅ Enviado:', info.response);
            resolve(info);
        }
    });
  });
};