const nodemailer = require('nodemailer');
require('dotenv').config();

// Reutilizamos la misma configuración robusta
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

module.exports = (correo_electronico, nombre_usuario, evento) => {
    const mailOptions = {
        from: `"Prism Club Tickets" <${process.env.GMAIL_USER}>`,
        to: correo_electronico,
        subject: '🎉 ¡Gracias por tu compra en Prism Club!',
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background: #f8f8f8;">
            <div style="max-width: 600px; margin: auto; background: white; padding: 25px; border-radius: 10px;">
                <h2 style="text-align: center; color: #6a0dad;">✨ ¡Gracias por tu compra, ${nombre_usuario}! ✨</h2>
                <p>Tu entrada para el evento <strong>${evento}</strong> está confirmada.</p>
                <hr>
                <p style="font-size: 12px; color: #666;">Prism Club</p>
            </div>
        </div>
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error('❌ Error compra:', err);
        else console.log('✅ Correo compra enviado:', info.response);
    });
};