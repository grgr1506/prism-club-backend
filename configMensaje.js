const nodemailer = require('nodemailer');
require('dotenv').config();

// --- CONFIGURACIÓN MANUAL "ANTIBLOQUEO" ---
const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',  // <--- CAMBIO: Usamos Resend en lugar de Gmail
    port: 465,
    secure: true,
    auth: {
        user: 'resend',       // <--- Siempre es 'resend'
        pass: process.env.GMAIL_PASS // <--- Tu API Key de Resend
    }
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