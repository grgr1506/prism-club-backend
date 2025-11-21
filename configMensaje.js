require('dotenv').config();
const { Resend } = require('resend');

// Inicializamos Resend con la API Key
const resend = new Resend(process.env.GMAIL_PASS); // Asumiendo que pusiste la API Key aquí

module.exports = async (formulario) => {
  try {
    const data = await resend.emails.send({
      from: 'Prism Club <onboarding@resend.dev>', // Usa este correo de prueba O tu dominio verificado en Resend
      to: [formulario.correo_electronico],
      subject: 'Gracias por contactarnos',
      html: `
        <h2>Hola ${formulario.nombre}!</h2>
        <p>Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.</p>
        <hr>
        <strong>Tu mensaje:</strong> ${formulario.mensaje} <br>
        <strong>Tipo Consulta:</strong> ${formulario.tipo_consulta}
      `
    });
    console.log('✅ Correo enviado (ID):', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error Resend:', error);
    throw error;
  }
};