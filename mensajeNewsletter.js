require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // Volvemos al host oficial
    port: 465,               // Puerto SSL directo (más rápido para evitar timeouts)
    secure: true,            // true para 465
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Ayuda si Render tiene certificados intermedios raros
    },
    family: 4 // Mantenemos esto por seguridad
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