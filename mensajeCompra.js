require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.GMAIL_PASS);

module.exports = async (correo_electronico, nombre_usuario, evento) => {
  try {
    const data = await resend.emails.send({
      from: 'Prism Club Tickets <tickets@prismclub.site>',
      to: [correo_electronico],
      subject: '🎉 ¡Tu acceso VIP está confirmado!',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #000000; }
          .container { max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid #333; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #7928ca, #ff0080); padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; text-shadow: 0px 0px 10px rgba(255, 255, 255, 0.3); }
          .content { padding: 40px 30px; text-align: center; color: #dddddd; }
          .user-name { color: #00bfff; font-size: 22px; margin-bottom: 10px; font-weight: bold; }
          .ticket-box { background-color: #1a1a1a; border: 1px dashed #555; padding: 20px; margin: 30px 0; border-radius: 8px; }
          .event-name { color: #ff0080; font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 10px 0; }
          .btn { display: inline-block; padding: 15px 40px; background-color: #ffffff; color: #000000; text-decoration: none; font-weight: 900; border-radius: 50px; text-transform: uppercase; font-size: 14px; transition: 0.3s; }
          .btn:hover { background-color: #00bfff; color: #ffffff; box-shadow: 0 0 15px #00bfff; }
          .footer { background-color: #080808; padding: 20px; text-align: center; color: #666666; font-size: 12px; border-top: 1px solid #222; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ticket Confirmado</h1>
          </div>
          <div class="content">
            <p class="user-name">Hola, ${nombre_usuario} ✨</p>
            <p>Tu compra ha sido procesada exitosamente. Prepárate para una experiencia inolvidable.</p>
            <div class="ticket-box">
              <p style="margin:0; font-size: 12px; color: #888; text-transform: uppercase;">Evento</p>
              <div class="event-name">${evento}</div>
              <p style="margin:0; font-size: 12px; color: #888;">Estado: <span style="color:#00ff88;">PAGADO</span></p>
            </div>
            <p>Presenta este correo en la entrada.</p>
            <br>
            <a href="https://www.prismclub.site" class="btn">Ver Mis Tickets</a>
          </div>
          <div class="footer">
            <p>¿Dudas? Contáctanos en soporte@prismclub.site</p>
            <p>© 2025 Prism Club</p>
          </div>
        </div>
      </body>
      </html>
      `
    });
    console.log('✅ Ticket enviado (ID):', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error enviando ticket:', error);
  }
};