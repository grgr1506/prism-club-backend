require('dotenv').config();
const nodemailer = require('nodemailer');

module.exports = (correo_electronico, nombre_usuario, evento) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    const mailOptions = {
        from: '"Prism Club Tickets" <' + process.env.GMAIL_USER + '>',
        to: correo_electronico,
        subject: '🎉 ¡Tu entrada para ' + evento + '!',
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
            <div style="background: white; padding: 30px; border-radius: 10px; border-top: 5px solid #6a0dad;">
                <h2 style="color: #6a0dad;">¡Hola, ${nombre_usuario}!</h2>
                <p>Tu compra para el evento <strong>${evento}</strong> ha sido confirmada.</p>
                <p>Presenta tu DNI en la puerta para ingresar.</p>
                <hr>
                <p style="font-size: 12px; color: #666;">Prism Club - Lima, Perú</p>
            </div>
        </div>
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error('❌ Error ticket:', err);
        else console.log('✅ Ticket enviado:', info.response);
    });
};