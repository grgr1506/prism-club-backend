require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.googlemail.com', // <--- Alias
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
    tls: { rejectUnauthorized: false },
    family: 4 // <--- IPv4
});

module.exports = (correo_destino) => {
    const mailOptions = {
        from: `"Prism Club Newsletter" <${process.env.GMAIL_USER}>`,
        to: correo_destino,
        subject: '🦄 ¡Bienvenido a PRISM CLUB!',
        html: `<h1>¡Suscripción exitosa!</h1>`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error('❌ Error newsletter:', err);
        else console.log('✅ Newsletter enviado:', info.response);
    });
};