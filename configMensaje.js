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
    from: '"Prism Club 👻" <prismclubservide@gmail.com>',
    to: formulario.correo_electronico,
    subject: 'Gracias por contactarnos',
    html: `
        <h2>Hola ${formulario.nombre}!</h2>
        <p>Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.</p>
        <hr>
        <strong>Tu mensaje:</strong> ${formulario.mensaje}
        <strong>Tipo Consulta:</strong> ${formulario.tipo_consulta}
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