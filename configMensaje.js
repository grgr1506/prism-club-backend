require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.GMAIL_PASS);

module.exports = async (formulario) => {
  try {
    const data = await resend.emails.send({
      from: 'Prism Club Soporte <onboarding@resend.dev>', // O 'soporte@tudominio.com'
      to: [formulario.correo_electronico],
      subject: 'Hemos recibido tu mensaje 📩',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #000000; }
          .container { max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid #333; border-radius: 8px; overflow: hidden; }
          .header { background-color: #000; padding: 30px; text-align: center; border-bottom: 2px solid #00bfff; }
          .header h1 { margin: 0; color: #ffffff; font-size: 24px; letter-spacing: 2px; }
          .content { padding: 40px 30px; color: #cccccc; }
          .message-box { background-color: #1f1f1f; border-left: 4px solid #00bfff; padding: 20px; margin: 20px 0; font-style: italic; color: #ffffff; }
          .footer { background-color: #0a0a0a; padding: 20px; text-align: center; color: #555555; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PRISM CLUB <span style="color:#00bfff;">SOPORTE</span></h1>
          </div>
          
          <div class="content">
            <h2 style="color: #ffffff;">Hola ${formulario.nombre},</h2>
            <p>Gracias por contactarnos. Nuestro equipo ya está revisando tu consulta.</p>
            
            <p>Copia de tu mensaje:</p>
            <div class="message-box">
              "${formulario.mensaje}"
            </div>
            
            <p><strong>Tipo de consulta:</strong> <span style="color: #00bfff;">${formulario.tipo_consulta}</span></p>
            
            <p>Te responderemos lo antes posible.</p>
          </div>

          <div class="footer">
            <p>Este es un mensaje automático, por favor no responder.</p>
            <p>© 2025 Prism Club</p>
          </div>
        </div>
      </body>
      </html>
      `
    });
    console.log('✅ Mensaje contacto enviado (ID):', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error Contacto:', error);
    // No lanzamos throw para no bloquear el flujo del usuario
  }
};