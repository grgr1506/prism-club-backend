// mensajeNewsletter.js
require('dotenv').config();
const nodemailer = require('nodemailer');

module.exports = (correo_destino) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
         auth: {
            user: process.env.GMAIL_USER, // Usa la variable
            pass: process.env.GMAIL_PASS  // Usa la variable
             }
    });

    const mailOptions = {
        from: '"Prism Club Newsletter" <prismclubservide@gmail.com>',
        to: correo_destino,
        subject: ' ¡Bienvenido a la comunidad PRISM CLUB!',
        html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #000; padding: 40px; color: #fff;">
            <div style="max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #ff0080; border-radius: 10px; overflow: hidden;">
                
                <div style="background: linear-gradient(90deg, #ff0080, #8a2be2); padding: 20px; text-align: center;">
                    <h1 style="margin: 0; color: #fff; font-size: 24px; letter-spacing: 2px;">PRISM CLUB</h1>
                </div>

                <div style="padding: 30px; text-align: center;">
                    <h2 style="color: #00bfff; margin-top: 0;">¡Gracias por suscribirte!</h2>
                    
                    <p style="font-size: 16px; color: #ddd; line-height: 1.6;">
                        Ya eres parte de nuestra lista exclusiva. Te mantendremos informado sobre:
                    </p>
                    
                    <ul style="text-align: left; display: inline-block; color: #bbb; margin: 20px 0;">
                        <li>✨ Eventos exclusivos y preventas VIP</li>
                        <li>🍸 Promociones en barra y reservas</li>
                        <li>🎵 Line-up de DJs internacionales</li>
                    </ul>

                    <div style="margin-top: 30px;">
                        <a href="http://localhost:4200" style="background-color: #ff0080; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                            Ver Próximos Eventos
                        </a>
                    </div>
                </div>

                <div style="background-color: #1a1a1a; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                    <p>© 2025 Prism Club. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error al enviar newsletter:', err);
        } else {
            console.log('Newsletter enviado a:', correo_destino);
        }
    });
};