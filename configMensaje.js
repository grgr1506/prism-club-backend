require('dotenv').config();
const nodemailer = require('nodemailer');


module.exports = (formulario) => {
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
        from: '"Prism Club Contacto" <' + process.env.GMAIL_USER + '>',
        to: formulario.correo_electronico, // Le responde al usuario
        bcc: process.env.GMAIL_USER,       // Te envía una copia oculta a ti
        subject: 'Hemos recibido tu mensaje - Prism Club',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #ff0080;">¡Hola ${formulario.nombre}!</h2>
                <p>Gracias por contactarnos. Hemos recibido tu consulta sobre <strong>${formulario.tipo_consulta}</strong>.</p>
                <hr>
                <p><strong>Tu mensaje:</strong></p>
                <p style="background: #f4f4f4; padding: 15px; border-radius: 5px;">${formulario.mensaje}</p>
                <hr>
                <p>Nuestro equipo te responderá a la brevedad.</p>
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