const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer'); 
const path = require('path'); 
const { v4: uuidv4 } = require('uuid');

// --- Importar Módulos de Correo ---
const configMensaje = require('./configMensaje');
const mensajeCompra = require('./mensajeCompra');
const mensajeNewsletter = require('./mensajeNewsletter');

// --- Configuración de Cloudinary ---
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'prism-club-assets',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage: storage });

// --- Configuración Stripe ---
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(bodyParser.json()); 
app.use(cors()); 
app.use('/Assets', express.static(path.join(__dirname, 'Assets')));

// =========================================================
//  CONEXIÓN A BASE DE DATOS BLINDADA (POOL)
// =========================================================
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    // Configuración vital para reconexión automática:
    waitForConnections: true,
    connectionLimit: 10, // Mantiene hasta 10 conexiones vivas
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Verificación de conexión inicial (opcional)
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error fatal conectando a la BD:', err.message);
    } else {
        console.log('✅ Conexión a la BD (Pool) exitosa.');
        connection.release(); // Liberamos la conexión inmediatamente
    }
});


// =========================================================
//  ENDPOINTS
// =========================================================

// GET Datos Home
app.get('/api/data/home', (req, res) => {
    const eventosQuery = `SELECT id_evento, titulo, descripcion, fecha_evento, precio_entrada, rutaImagen, es_vip_exclusivo, activo FROM eventos WHERE fecha_evento >= now() AND activo = 1 ORDER BY fecha_evento ASC LIMIT 6`;
    const membresiasQuery = `SELECT id_membresia, nombre, descripcion, precio_mensual, beneficios FROM membresias`;

    db.query(eventosQuery, (err, eventosResults) => {
        if (err) {
            console.error('Error eventos home:', err);
            return res.status(500).json({ error: 'Error BD Eventos' });
        }
        
        db.query(membresiasQuery, (err, membresiasResults) => {
            if (err) {
                console.error('Error membresías home:', err);
                return res.status(500).json({ error: 'Error BD Membresías' });
            }

            res.json({
                eventos: eventosResults,
                membresias: membresiasResults
            });
        });
    });
});

// POST Contacto
app.post('/api/data/contact', async(req, res) => {
    const { nombre, apellido, correo_electronico, numero_telefono, tipo_consulta, mensaje } = req.body;
    
    // 1. Guardar en BD
    const sql = `INSERT INTO mensajescontacto (nombre, apellido, correo_electronico, numero_telefono, tipo_consulta, mensaje) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [nombre, apellido, correo_electronico, numero_telefono || null, tipo_consulta, mensaje];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error guardando contacto:', err);
            return res.status(500).json({ error: 'Error al guardar el mensaje.' });
        }
        
        // 2. Si guardó bien, enviamos el correo
        console.log("📩 Datos guardados, enviando correo...");
        try {
            configMensaje(req.body);
            // Respondemos éxito al cliente sin esperar al correo (para que sea rápido)
            res.status(201).json({ message: 'Mensaje recibido y correo en proceso', id: results.insertId });
        } catch (emailErr) {
            console.error("Error iniciando envío de correo:", emailErr);
            res.status(201).json({ message: 'Mensaje guardado, pero falló el correo', id: results.insertId });
        }
    });
});

// POST Newsletter
app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    try {
        mensajeNewsletter(email);
        res.json({ message: 'Suscripción exitosa' });
    } catch (err) {
        console.error("Error newsletter:", err);
        res.status(500).json({ error: 'Error al enviar correo' });
    }
});

// GET Lista Eventos
app.get('/api/eventosLista', (req, res) => {
    const sql = `SELECT id_evento, titulo, descripcion, fecha_evento, precio_entrada, rutaImagen, es_vip_exclusivo, activo FROM eventos WHERE fecha_evento >= now() AND activo = 1 ORDER BY fecha_evento`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error DB' });
        res.json(results);
    });
});

// --- Auth ---
app.post('/api/auth/register', (req, res) => {
    const { nombre, apellido, correo_electronico, numero_telefono, hash_contrasena } = req.body;
    const sql = `INSERT INTO usuarios (nombre, apellido, correo_electronico, numero_telefono, hash_contrasena, tipo_usuario) VALUES (?, ?, ?, ?, ?, 'cliente')`;
    
    db.query(sql, [nombre, apellido, correo_electronico, numero_telefono || null, hash_contrasena], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email ya registrado' });
            return res.status(500).json({ error: 'Error en registro' });
        }
        res.status(201).json({ message: 'Usuario creado', id: results.insertId });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { correo_electronico, hash_contrasena } = req.body;
    const sql = `SELECT id_usuario, nombre, tipo_usuario, hash_contrasena FROM usuarios WHERE correo_electronico = ?`;

    db.query(sql, [correo_electronico], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error interno' });
        if (results.length === 0 || results[0].hash_contrasena !== hash_contrasena) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const user = results[0];
        res.json({
            message: 'Login exitoso',
            user: { id: user.id_usuario, nombre: user.nombre, rol: user.tipo_usuario }
        });
    });
});

// --- Admin ---
app.get('/api/admin/analytics', (req, res) => {
    const q1 = `SELECT COUNT(id_evento) AS total_activos FROM eventos WHERE fecha_evento >= NOW() AND activo = 1`;
    const q2 = `SELECT E.titulo, COUNT(T.id_entrada) AS entradas_vendidas FROM entradas T JOIN eventos E ON T.id_evento = E.id_evento GROUP BY E.id_evento ORDER BY entradas_vendidas DESC`;
    const q3 = `SELECT MONTH(fecha_pedido) AS mes, SUM(monto_total) AS ingresos FROM pedidosentradas WHERE YEAR(fecha_pedido) = YEAR(NOW()) AND estado_pago = 'pagado' GROUP BY MONTH(fecha_pedido) ORDER BY mes ASC`;
    const q4 = `SELECT COUNT(DISTINCT id_usuario) AS total_vip FROM suscripcionesusuarios WHERE estado = 'activo' AND fecha_fin >= CURDATE()`;
    const q5 = `SELECT COUNT(id_usuario) AS total_users FROM usuarios WHERE tipo_usuario = 'cliente'`;

    const exec = (sql) => new Promise((resolve, reject) => db.query(sql, (e, r) => e ? reject(e) : resolve(r)));

    Promise.all([exec(q1), exec(q2), exec(q3), exec(q4), exec(q5)])
        .then(([r1, r2, r3, r4, r5]) => {
            res.json({
                eventosActivos: r1[0]?.total_activos || 0,
                ticketsPorEvento: r2,
                ingresosMensuales: r3,
                clientesVipActivos: r4[0]?.total_vip || 0,
                usuariosActivos: r5[0]?.total_users || 0
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: "Error analytics" });
        });
});

app.get('/api/admin/eventos', (req, res) => {
    const sql = `SELECT id_evento, titulo, descripcion, DATE_FORMAT(fecha_evento, '%Y-%m-%dT%H:%i') AS fecha_evento, precio_entrada, capacidad_maxima, rutaImagen, es_vip_exclusivo, activo FROM eventos ORDER BY fecha_evento DESC`;
    db.query(sql, (err, results) => res.json(results));
});

app.post('/api/admin/eventos', upload.single('imagen'), (req, res) => {
    const { titulo, descripcion, fecha_evento, precio_entrada, capacidad_maxima, es_vip_exclusivo } = req.body;
    const rutaImagen = req.file ? req.file.path : 'https://via.placeholder.com/300'; 
    const sql = `INSERT INTO eventos (titulo, descripcion, fecha_evento, precio_entrada, capacidad_maxima, rutaImagen, es_vip_exclusivo, entradas_disponibles, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`;
    const values = [titulo, descripcion, fecha_evento, precio_entrada, capacidad_maxima, rutaImagen, es_vip_exclusivo, capacidad_maxima];

    db.query(sql, values, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al crear evento' });
        res.status(201).json({ message: 'Evento creado', id_evento: results.insertId });
    });
});

app.put('/api/admin/eventos/:id', upload.single('imagen'), (req, res) => {
    const { titulo, descripcion, fecha_evento, precio_entrada, capacidad_maxima, es_vip_exclusivo, rutaImagenExistente } = req.body;
    const rutaImagen = req.file ? req.file.path : rutaImagenExistente;
    const sql = `UPDATE eventos SET titulo=?, descripcion=?, fecha_evento=?, precio_entrada=?, capacidad_maxima=?, rutaImagen=?, es_vip_exclusivo=? WHERE id_evento=?`;
    const values = [titulo, descripcion, fecha_evento, precio_entrada, capacidad_maxima, rutaImagen, es_vip_exclusivo, req.params.id];

    db.query(sql, values, (err) => {
        if (err) return res.status(500).json({ error: 'Error actualizando' });
        res.json({ message: 'Actualizado' });
    });
});

app.patch('/api/admin/eventos/:id', (req, res) => {
    const { activo } = req.body;
    db.query(`UPDATE eventos SET activo=? WHERE id_evento=?`, [activo ? 1 : 0, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Error' });
        res.json({ message: 'Estado actualizado' });
    });
});

app.delete('/api/admin/eventos/:id', (req, res) => {
    db.query(`DELETE FROM eventos WHERE id_evento=?`, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Error' });
        res.json({ message: 'Eliminado' });
    });
});

app.get('/api/admin/mensajes', (req, res) => {
    db.query(`SELECT * FROM mensajescontacto ORDER BY enviado_en DESC`, (err, results) => res.json(results));
});

app.patch('/api/admin/mensajes/:id', (req, res) => {
    db.query(`UPDATE mensajescontacto SET leido=? WHERE id_mensaje=?`, [req.body.leido ? 1 : 0, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Error' });
        res.json({ message: 'Actualizado' });
    });
});

// --- Stripe ---
app.post("/checkout/create", async (req, res) => {
    const { items, asistentes, email, nombreEvento } = req.body;
    const line_items = items.map(item => ({
        price_data: {
            currency: "pen",
            product_data: { name: item.eventName },
            unit_amount: item.price * 100,
        },
        quantity: item.quantity,
    }));

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items,
            ui_mode: "embedded",
            return_url: `${FRONTEND_URL}/payment-result?session_id={CHECKOUT_SESSION_ID}`,
            metadata: { asistentes: JSON.stringify(asistentes), email, nombreEvento }
        });
        res.json({ clientSecret: session.client_secret, sessionId: session.id });
    } catch (err) {
        res.status(500).json({ error: "Error Stripe" });
    }
});

app.get("/checkout/session-status", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        res.json({
            status: session.status,
            amount: session.amount_total / 100,
            currency: session.currency,
            metadata: session.metadata
        });
    } catch (err) {
        res.status(400).json({ error: "Sesión inválida" });
    }
});

app.post("/save-purchase", (req, res) => {
    const { asistentes, amount, id_usuario, correo_usuario, nombre_usuario } = req.body;
    const sqlPedido = `INSERT INTO pedidosentradas (id_usuario, monto_total, estado_pago, metodo_pago) VALUES (?, ?, 'pagado', 'stripe')`;
    
    db.query(sqlPedido, [id_usuario, amount], (err, result) => {
        if (err) return res.status(500).json({ error: "Error pedido" });
        const pedidoId = result.insertId;
        const sqlEntrada = `INSERT INTO entradas (id_pedido_entrada, id_evento, id_usuario_asistente, codigo_qr, precio_pagado, fecha_compra, estado) VALUES (?, ?, ?, ?, ?, NOW(), 'valida')`;

        asistentes.forEach(as => {
            const qrCode = `QR-${pedidoId}-${uuidv4()}`;
            db.query(sqlEntrada, [pedidoId, as.id_evento, id_usuario, qrCode, amount], (e) => {
                if (!e) mensajeCompra(correo_usuario, nombre_usuario, as.nombre_evento);
            });
        });
        res.json({ success: true, pedidoId });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});