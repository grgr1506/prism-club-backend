const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = (formulario) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // <--- USAR HOST
    port: 587,              // <--- PUERTO 587
    secure: false,          // <--- FALSE
    auth: {
      user: process.env.GMAIL_USER || 'prismclubservide@gmail.com',
      pass: process.env.GMAIL_PASS || 'vtxs dvtd wfdb awru'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: '"Prism Club Contacto" <' + (process.env.GMAIL_USER || 'prismclubservide@gmail.com') + '>',
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
      console.error('❌ Error al enviar el correo:', err); // Este es el error que ves en consola
    } else {
      console.log('✅ Correo enviado:', info.response);
    }
  });
};