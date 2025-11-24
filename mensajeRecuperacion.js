// grgr1506/prism-club-backend/.../mensajeRecuperacion.js
require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.GMAIL_PASS); // Asegúrate de usar tu variable de entorno correcta

module.exports = async (email, nuevaContrasena) => {
  try {
    const data = await resend.emails.send({
      from: 'Prism Club Soporte <soporte@prismclub.site>',
      to: [email],
      subject: 'Recuperación de Contraseña 🔐',
      html: `
      <div style="font-family: Arial; background-color: #000; color: #fff; padding: 20px;">
        <h1 style="color: #ff6b35;">Prism Club</h1>
        <p>Hola,</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Tu nueva contraseña temporal es: <strong style="color: #00bfff; font-size: 18px;">${nuevaContrasena}</strong></p>
        <p>Por favor, ingresa con esta clave y cámbiala lo antes posible.</p>
      </div>
      `
    });
    return data;
  } catch (error) {
    console.error('Error enviando correo recuperación:', error);
  }
};