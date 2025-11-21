const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',  // <--- CAMBIO: Usamos Resend en lugar de Gmail
    port: 465,
    secure: true,
    auth: {
        user: 'resend',       // <--- Siempre es 'resend'
        pass: process.env.GMAIL_PASS // <--- Tu API Key de Resend
    }
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