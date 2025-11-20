require('dotenv').config();
const nodemailer = require('nodemailer');

module.exports = (correo_electronico, nombre_usuario, evento) => {
   const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Mejor explícito que service: 'gmail'
    port: 465,              // Puerto seguro SSL
    secure: true,           // True para 465
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

    const mailOptions = {
        from: '"Prism Club" <prismclubservide@gmail.com>',
        to: correo_electronico,
        subject: '🎉 ¡Gracias por tu compra en Prism Club!',
        html: `
        <div style="font-family: Arial, Helvetica, sans-serif; padding: 20px; color: #333; background: #f8f8f8;">
            <div style="max-width: 600px; margin: auto; background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                
                <h2 style="text-align: center; color: #6a0dad;">✨ ¡Gracias por tu compra, ${nombre_usuario}! ✨</h2>
                
                <p style="font-size: 16px; line-height: 1.5;">
                    Estamos muy agradecidos por confiar en <strong>Prism Club</strong> para tu experiencia.
                </p>

                <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">

                <h3 style="color: #6a0dad;"> Detalles de tu compra</h3>

                <p style="font-size: 15px;">
                    <strong>Evento:</strong> ${evento}
                </p>

                <p style="font-size: 15px;">
                    Pronto recibirás más información y tus accesos correspondientes.
                </p>

                <div style="margin-top: 30px; text-align: center;">
                    <a href="https://prismclub.com" style="background: #6a0dad; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px;">
                        Ir a Prism Club
                    </a>
                </div>

                <p style="font-size: 13px; color: #666; margin-top: 30px; text-align: center;">
                    Si tienes alguna consulta, contáctanos por nuestros canales oficiales.<br>
                    © 2025 Prism Club. Todos los derechos reservados.
                </p>

            </div>
        </div>
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error al enviar el correo:', err);
        } else {
            console.log('Correo enviado:', info.response);
        }
    });
};