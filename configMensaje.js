const nodemailer = require('nodemailer');
require('dotenv').config();

// Creamos el transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',       // <--- Usamos el preset 'gmail' integrado en v6
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verificar conexión al iniciar
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Error verificando SMTP:', error);
    } else {
        console.log('✅ Servidor de Correos listo (v6.9)');
    }
});

module.exports = (formulario) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
        from: `"Prism Club" <${process.env.GMAIL_USER}>`,
        to: formulario.correo_electronico,
        subject: 'Gracias por contactarnos',
        html: `
            <h2>Hola ${formulario.nombre}!</h2>
            <p>Recibimos tu mensaje: ${formulario.mensaje}</p>
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