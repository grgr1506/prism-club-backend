// configMensaje.js
const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = (formulario) => {
  return new Promise((resolve, reject) => { // <--- Envolvemos en Promise
    const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true para puerto 465
    auth: {
        user: process.env.GMAIL_USER || 'prismclubservide@gmail.com',
        pass: process.env.GMAIL_PASS 
    },
    tls: {
        rejectUnauthorized: false
    },
    family: 4 // Forzar IPv4 para evitar errores de red en Render
});

    const mailOptions = {
      from: `"Prism Club Contacto" <${process.env.GMAIL_USER}>`,
      to: formulario.correo_electronico, // Asegúrate de enviar copia al usuario o al admin según necesites
      subject: 'Gracias por contactarnos',
      html: `...tu html...`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('❌ Error correo:', err);
        reject(err); // <--- Rechazamos si falla
      } else {
        console.log('✅ Correo enviado:', info.response);
        resolve(info); // <--- Resolvemos si funciona
      }
    });
  });
};