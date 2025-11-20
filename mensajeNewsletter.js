// mensajeNewsletter.js
require('dotenv').config();
const nodemailer = require('nodemailer');

module.exports = (correo_destino) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    const mailOptions = {
        from: '"Prism Club Newsletter" <' + process.env.GMAIL_USER + '>',
        to: correo_destino,
        subject: '🦄 ¡Bienvenido a la comunidad PRISM CLUB!',
        html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #000; padding: 40px; color: #fff; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #ff0080; border-radius: 10px; padding: 20px;">
                <h1 style="color: #ff0080;">PRISM CLUB</h1>
                <h2 style="color: #00bfff;">¡Suscripción Confirmada!</h2>
                <p style="color: #ccc; font-size: 16px;">Ya eres parte de nuestra lista exclusiva.</p>
                <p style="color: #888;">Pronto recibirás novedades sobre eventos y accesos VIP.</p>
            </div>
        </div>
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error('❌ Error newsletter:', err);
        else console.log('✅ Newsletter enviado:', info.response);
    });
};