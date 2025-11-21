require('dotenv').config();
const { Resend } = require('resend');
const resend = new Resend(process.env.GMAIL_PASS);

module.exports = async (correo_electronico, nombre_usuario, evento) => {
  try {
    const data = await resend.emails.send({
      from: 'Prism Club Tickets <onboarding@resend.dev>',
      to: [correo_electronico],
      subject: '🎉 ¡Gracias por tu compra en Prism Club!',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>¡Gracias ${nombre_usuario}!</h2>
            <p>Tu entrada para <strong>${evento}</strong> está confirmada.</p>
        </div>
      `
    });
    console.log('✅ Ticket enviado:', data.id);
  } catch (error) {
    console.error('❌ Error enviando ticket:', error);
  }
};