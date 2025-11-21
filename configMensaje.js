const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. Crear el transporter FUERA de la función (Singleton)
const transporter = nodemailer.createTransport({
    pool: true,             // <--- CRUCIAL: Reutiliza conexiones
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
    tls: { rejectUnauthorized: false },
    family: 4,              // Fuerza IPv4
    connectionTimeout: 10000 // 10 segundos máximo de espera
});

// Verificar conexión al iniciar (te dirá en los logs si todo está bien)
transporter.verify((error, success) => {
    if (error) console.error('❌ Error conexión SMTP:', error);
    else console.log('✅ Servidor SMTP listo para enviar correos');
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
            <strong>Tu mensaje:</strong> ${formulario.mensaje} <br>
            <strong>Tipo Consulta:</strong> ${formulario.tipo_consulta}
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('❌ Error envío:', err);
            reject(err);
        } else {
            console.log('✅ Correo enviado:', info.response);
            resolve(info);
        }
    });
  });
};