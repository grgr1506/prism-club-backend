require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',  // <--- CAMBIO: Usamos Resend en lugar de Gmail
    port: 465,
    secure: true,
    auth: {
        user: 'resend',       // <--- Siempre es 'resend'
        pass: process.env.GMAIL_PASS // <--- Tu API Key de Resend
    }
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