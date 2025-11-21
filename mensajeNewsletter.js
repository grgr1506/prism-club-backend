require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    pool: true,
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
    tls: { rejectUnauthorized: false },
    family: 4,
    connectionTimeout: 10000
});

module.exports = (correo_destino) => {
    const mailOptions = {
        from: `"Prism Club Newsletter" <${process.env.GMAIL_USER}>`,
        to: correo_destino,
        subject: '🦄 ¡Bienvenido a la comunidad PRISM CLUB!',
        html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #000; padding: 40px; color: #fff; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #ff0080; border-radius: 10px; padding: 20px;">
                <h1 style="color: #ff0080;">PRISM CLUB</h1>
                <h2 style="color: #00bfff;">¡Suscripción Confirmada!</h2>
                <p style="color: #ccc; font-size: 16px;">Ya eres parte de nuestra lista exclusiva.</p>
            </div>
        </div>
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error('❌ Error newsletter:', err);
        else console.log('✅ Newsletter enviado:', info.response);
    });
};