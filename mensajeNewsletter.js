require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.GMAIL_PASS);

module.exports = async (correo_destino) => {
  try {
    const data = await resend.emails.send({
      from: 'Prism Club <info@prismclub.site>',
      to: [correo_destino],
      subject: '🦄 ¡Bienvenido al universo PRISM CLUB!',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #000000; }
          .container { max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid #333; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(90deg, #ff0080, #7928ca); padding: 30px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 32px; letter-spacing: 2px; text-transform: uppercase; }
          .content { padding: 40px 20px; text-align: center; color: #dddddd; }
          .welcome-text { font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 20px; }
          .divider { height: 2px; width: 50px; background-color: #00bfff; margin: 20px auto; }
          .btn { display: inline-block; padding: 15px 30px; margin-top: 20px; background-color: #00bfff; color: #000000; text-decoration: none; font-weight: bold; border-radius: 50px; text-transform: uppercase; font-size: 14px; transition: 0.3s; }
          .btn:hover { background-color: #ffffff; }
          .footer { background-color: #000000; padding: 20px; text-align: center; color: #666666; font-size: 12px; border-top: 1px solid #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PRISM CLUB</h1>
          </div>
          <div class="content">
            <p class="welcome-text">¡Ya eres parte de la comunidad!</p>
            <div class="divider"></div>
            <p>Hola,</p>
            <p>Gracias por suscribirte a nuestro newsletter exclusivo. A partir de ahora, serás el primero en enterarte de:</p>
            <ul style="list-style: none; padding: 0; color: #aaa;">
              <li>🔥 Próximos eventos VIP</li>
              <li>🎟️ Descuentos en entradas</li>
              <li>🍸 Noticias del club</li>
            </ul>
            <a href="https://www.prismclub.site" class="btn">Ver Próximos Eventos</a>
          </div>
          <div class="footer">
            <p>© 2025 Prism Club. Todos los derechos reservados.</p>
            <p>Lima, Perú</p>
          </div>
        </div>
      </body>
      </html>
      `
    });
    console.log('✅ Newsletter enviado (ID):', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error al enviar Newsletter:', error);
  }
};