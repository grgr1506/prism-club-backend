const nodemailer = require('nodemailer');
require('dotenv').config();

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

module.exports = (correo_electronico, nombre_usuario, evento) => {
    const mailOptions = {
        from: `"Prism Club Tickets" <${process.env.GMAIL_USER}>`,
        to: correo_electronico,
        subject: '🎉 ¡Gracias por tu compra en Prism Club!',
        html: `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>¡Gracias ${nombre_usuario}!</h2>
            <p>Tu entrada para <strong>${evento}</strong> está confirmada.</p>
        </div>
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error('❌ Error compra:', err);
        else console.log('✅ Correo compra enviado:', info.response);
    });
};