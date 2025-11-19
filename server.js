// prism-club-backend/server.js
require('dotenv').config()
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer'); 
const path = require('path'); 
const configMensaje = require('./configMensaje')
const mensajeCompra = require('./mensajeCompra')
const { v4: uuidv4 } = require('uuid');
const mensajeNewsletter = require('./mensajeNewsletter');


//STRIPE 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const YOUR_DOMAIN = 'http://localhost:4200';

const app = express();


// Middlewares
app.use(bodyParser.json()); 
app.use(cors()); 

// FIX 1: SERVIR ARCHIVOS ESTÁTICOS DE LA CARPETA ASSETS DE ANGULAR
// AHORA DEBE QUEDAR ASÍ:
app.use('/Assets', express.static(path.join(__dirname, 'Assets')));

const ABSOLUTE_ASSETS_PATH = path.join(__dirname, 'Assets', 'Img');

// --- CONFIGURACIÓN DE ALMACENAMIENTO DE MULTER ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, ABSOLUTE_ASSETS_PATH);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });


// --- Configuración de la Conexión a la Base de Datos ---
// server.js
const db = mysql.createConnection({
    host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',      // El mismo que pusiste en Heidi
    port: 4000,
    user: '2etB9DCRJcFdfFs.root',
    password: 'OxNNZ1R8YsGf9geD',
    database: 'club_prism_eventos_db',
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});


// Conectar a MySQL
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('✅ Conexión a la base de datos (club_prism_eventos_db) exitosa.');
});


// =========================================================
// ENDPOINTS DE ADMINISTRACIÓN DE EVENTOS (CRUD)
// =========================================================

app.get('/api/admin/mensajes', (req, res) => {
    // Ordenar por fecha de envío descendente
    const sql = `SELECT id_mensaje, nombre, apellido, correo_electronico, numero_telefono, tipo_consulta, mensaje, enviado_en, leido FROM MensajesContacto ORDER BY enviado_en DESC`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener mensajes de contacto:', err);
            return res.status(500).json({ error: 'Error al obtener los mensajes de la DB.' });
        }
        
        // Formatear la respuesta (leido como booleano)
        const mensajes = results.map(m => ({
            ...m,
            leido: m.leido === 1
        }));

        res.json(mensajes);
    });
});

// PATCH /api/admin/mensajes/:id - Marcar como leído/no leído
app.patch('/api/admin/mensajes/:id', (req, res) => {
    const mensajeId = req.params.id;
    const { leido } = req.body; 

    const sql = `UPDATE MensajesContacto SET leido = ? WHERE id_mensaje = ?`;
    const statusValue = leido ? 1 : 0; 

    db.query(sql, [statusValue, mensajeId], (err, results) => {
        if (err) {
            console.error('Error al cambiar estado del mensaje:', err);
            return res.status(500).json({ error: 'Error al actualizar el estado en la DB.' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Mensaje no encontrado.' });
        }
        
        res.json({ message: 'Estado del mensaje actualizado exitosamente.' });
    });
});

// GET /api/admin/eventos - Obtener todos los eventos para el panel Admin
app.get('/api/admin/eventos', (req, res) => {
    // FIX SQL: Sentencia en una sola línea
    const sql = `SELECT id_evento, titulo, descripcion, DATE_FORMAT(fecha_evento, '%Y-%m-%dT%H:%i') AS fecha_evento, precio_entrada, capacidad_maxima, rutaImagen, es_vip_exclusivo, activo FROM Eventos ORDER BY fecha_evento DESC`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener todos los eventos:', err);
            return res.status(500).json({ error: 'Error al obtener los eventos de la DB.' });
        }
        
        const eventsForAdmin = results.map(e => ({
            ...e,
            activo: e.activo === 1 
        }));

        res.json(eventsForAdmin);
    });
});

// =========================================================
// ENDPOINT NEWSLETTER
// =========================================================
app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'El email es obligatorio.' });
    }

    // 1. Enviar el correo de bienvenida
    mensajeNewsletter(email);

    // 2. (Opcional) Si quisieras guardarlo en BD en el futuro, aquí iría el INSERT
    
    res.json({ message: 'Suscripción exitosa. Correo enviado.' });
});


// POST /api/admin/eventos - Crear un nuevo evento (USA MULTER)
app.post('/api/admin/eventos', upload.single('imagen'), (req, res) => {
    const { 
        titulo, descripcion, fecha_evento, precio_entrada, 
        capacidad_maxima, es_vip_exclusivo 
    } = req.body;
    
    // FIX 2: La ruta web que se guarda debe ser absoluta (con /)
    const rutaImagen = req.file 
        ? `/Assets/Img/${req.file.filename}` 
        : '/Assets/Img/default.jpg'; 

    // FIX 3: Sentencia en una sola línea y FIX de valores (se usan 9 placeholders y 9 valores)
    const sql = `INSERT INTO Eventos (titulo, descripcion, fecha_evento, precio_entrada, capacidad_maxima, rutaImagen, es_vip_exclusivo, entradas_disponibles, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
        titulo, 
        descripcion, 
        fecha_evento, 
        precio_entrada, 
        capacidad_maxima, 
        rutaImagen, 
        es_vip_exclusivo, 
        capacidad_maxima, // entradas_disponibles
        1 // activo
    ];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error al insertar evento:', err);
            return res.status(500).json({ error: 'Error al procesar la inserción en la base de datos.' });
        }
        
        res.status(201).json({ 
            message: 'Evento creado exitosamente.', 
            id_evento: results.insertId,
            rutaImagen: rutaImagen 
        });
    });
});

// PUT /api/admin/eventos/:id - Actualizar evento (USA MULTER)
app.put('/api/admin/eventos/:id', upload.single('imagen'), (req, res) => {
    const eventId = req.params.id;
    const { 
        titulo, descripcion, fecha_evento, precio_entrada, 
        capacidad_maxima, es_vip_exclusivo, rutaImagenExistente
    } = req.body;
    
    let rutaImagen;

    if (req.file) {
        // FIX 4: Asegurar el slash inicial al actualizar imagen
        rutaImagen = `/Assets/Img/${req.file.filename}`;
    } else {
        // Usar la ruta existente (que ahora es absoluta)
        rutaImagen = rutaImagenExistente || ''; 
    }

    // FIX 5: Limpieza SQL
    const sql = `UPDATE Eventos SET titulo = ?, descripcion = ?, fecha_evento = ?, precio_entrada = ?, capacidad_maxima = ?, rutaImagen = ?, es_vip_exclusivo = ? WHERE id_evento = ?`;
    
    const values = [
        titulo, descripcion, fecha_evento, precio_entrada, 
        capacidad_maxima, rutaImagen, es_vip_exclusivo, eventId
    ];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error al actualizar evento:', err);
            return res.status(500).json({ error: 'Error al procesar la actualización en la base de datos.' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Evento no encontrado.' });
        }
        
        res.json({ message: 'Evento actualizado exitosamente.', rutaImagen: rutaImagen });
    });
});

// PATCH /api/admin/eventos/:id - Actualizar estado (Soft Delete)
app.patch('/api/admin/eventos/:id', (req, res) => {
    const eventId = req.params.id;
    const { activo } = req.body; 

    // FIX 6: Limpieza SQL
    const sql = `UPDATE Eventos SET activo = ? WHERE id_evento = ?`;
    
    const statusValue = activo ? 1 : 0; 

    db.query(sql, [statusValue, eventId], (err, results) => {
        if (err) {
            console.error('Error al cambiar el estado (activo/inactivo):', err);
            return res.status(500).json({ error: 'Error al cambiar el estado en la base de datos. Verifique la columna "activo".' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Evento no encontrado.' });
        }
        
        res.json({ message: 'Estado del evento actualizado exitosamente.' });
    });
});


// DELETE /api/admin/eventos/:id - Eliminar permanentemente (Hard Delete)
app.delete('/api/admin/eventos/:id', (req, res) => {
    const eventId = req.params.id;
    
    // FIX 7: Limpieza SQL
    const sql = `DELETE FROM Eventos WHERE id_evento = ?`;

    db.query(sql, [eventId], (err, results) => {
        if (err) {
            console.error('Error al eliminar evento:', err);
            
            if (err.code && (err.code.startsWith('ER_ROW_IS_REFERENCED') || err.errno === 1451)) {
                 return res.status(409).json({ error: 'No se puede eliminar el evento. Aún tiene entradas vendidas asociadas.' });
            }

            return res.status(500).json({ error: 'Error al eliminar el evento de la base de datos.' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Evento no encontrado.' });
        }
        
        res.json({ message: 'Evento eliminado permanentemente.' });
    });
});


// =========================================================
// OTROS ENDPOINTS EXISTENTES
// =========================================================

// =========================================================
// ENDPOINT ANALYTICS (CORREGIDO)
// =========================================================

app.get('/api/admin/analytics', (req, res) => {
    
    // 1. Contar Eventos Activos (Futuros y marcados como activos)
    const countActiveEventsQuery = `
        SELECT COUNT(id_evento) AS total_activos 
        FROM Eventos 
        WHERE fecha_evento >= NOW() AND activo = 1
    `;
    
    // 2. Tickets Vendidos por Evento
    const ticketsByEventQuery = `
        SELECT E.titulo, COUNT(T.id_entrada) AS entradas_vendidas 
        FROM Entradas T 
        JOIN Eventos E ON T.id_evento = E.id_evento 
        GROUP BY E.id_evento 
        ORDER BY entradas_vendidas DESC
    `;
    
    // 3. Ingresos Mensuales (Solo pedidos PAGADOS del año actual)
    const monthlyRevenueQuery = `
        SELECT MONTH(fecha_pedido) AS mes, SUM(monto_total) AS ingresos 
        FROM PedidosEntradas 
        WHERE YEAR(fecha_pedido) = YEAR(NOW()) AND estado_pago = 'pagado'
        GROUP BY MONTH(fecha_pedido) 
        ORDER BY mes ASC
    `;

    // 4. Clientes VIP Activos (NUEVO: Cuenta suscripciones activas vigentes)
    const activeVipQuery = `
        SELECT COUNT(DISTINCT id_usuario) AS total_vip 
        FROM SuscripcionesUsuarios 
        WHERE estado = 'activo' AND fecha_fin >= CURDATE()
    `;

    // 5. Usuarios Activos/Registrados (NUEVO: Cuenta total de clientes)
    const activeUsersQuery = `
        SELECT COUNT(id_usuario) AS total_users 
        FROM Usuarios 
        WHERE tipo_usuario = 'cliente'
    `;

    // Función auxiliar para promesas
    const executeQuery = (sql) => new Promise((resolve, reject) => {
        db.query(sql, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

    // Ejecutar todas las consultas en paralelo
    Promise.all([
        executeQuery(countActiveEventsQuery),
        executeQuery(ticketsByEventQuery),
        executeQuery(monthlyRevenueQuery),
        executeQuery(activeVipQuery),   // <--- Faltaba esto
        executeQuery(activeUsersQuery)  // <--- Faltaba esto
    ])
    .then(results => {
        const [activeEvents, ticketsData, revenueData, vipData, usersData] = results;

        res.json({
            eventosActivos: activeEvents[0]?.total_activos || 0,
            ticketsPorEvento: ticketsData,
            ingresosMensuales: revenueData,
            // Mapeamos los resultados de las nuevas consultas:
            clientesVipActivos: vipData[0]?.total_vip || 0,
            usuariosActivos: usersData[0]?.total_users || 0
        });
    })
    .catch(error => {
        console.error("Error en las consultas de analíticas:", error);
        res.status(500).json({ error: "Error al obtener datos analíticos de la base de datos." });
    });
});

app.post('/api/auth/register', (req, res) => {
    const { nombre, apellido, correo_electronico, numero_telefono, hash_contrasena } = req.body;
    
    const tipo_usuario = 'cliente'; 

    // FIX 11: Limpieza SQL
    const sql = `INSERT INTO Usuarios (nombre, apellido, correo_electronico, numero_telefono, hash_contrasena, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [nombre, apellido, correo_electronico, numero_telefono || null, hash_contrasena, tipo_usuario];

    db.query(sql, values, (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
            }
            console.error('Error al registrar nuevo usuario:', err);
            return res.status(500).json({ error: 'Error al procesar el registro.' });
        }
        
        res.status(201).json({ 
            message: 'Registro exitoso. Ya puedes iniciar sesión.', 
            id: results.insertId 
        });
    });
}); 
app.post('/api/data/contact', (req, res) => {
  const { 
    nombre, apellido, correo_electronico, numero_telefono, 
    tipo_consulta, mensaje 
  } = req.body;

  const sql = `
    INSERT INTO MensajesContacto (nombre, apellido, correo_electronico, numero_telefono, tipo_consulta, mensaje)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [nombre, apellido, correo_electronico, numero_telefono || null, tipo_consulta, mensaje];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error al insertar mensaje de contacto:', err);
      return res.status(500).json({ error: 'Error al procesar el mensaje.' });
    }
    configMensaje(req.body);

    res.status(201).json({ message: 'Mensaje guardado y correo enviado correctamente', id: results.insertId });
  });
});

app.get('/api/data/home', (req, res) => {
    // 🚨 FIX 13 CRÍTICO: Sentencia SQL en una sola línea para resolver el error de parsing
    const eventosQuery = `SELECT id_evento, titulo, descripcion, fecha_evento, precio_entrada, rutaImagen, es_vip_exclusivo, activo FROM eventos WHERE fecha_evento >= now() AND activo = 1 ORDER BY fecha_evento ASC LIMIT 6`;
    
    // FIX 14: Limpieza SQL
    const membresiasQuery = `SELECT id_membresia, nombre, descripcion, precio_mensual, beneficios FROM Membresias`;

    db.query(eventosQuery, (err, eventosResults) => {
        if (err) {
            console.error('Error al consultar eventos:', err);
            return res.status(500).json({ error: 'Error al obtener eventos' });
        }
        
        db.query(membresiasQuery, (err, membresiasResults) => {
            if (err) {
                console.error('Error al consultar membresías:', err);
                return res.status(500).json({ error: 'Error al obtener membresías' });
            }

            res.json({
                eventos: eventosResults,
                membresias: membresiasResults
            });
        });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { correo_electronico, hash_contrasena } = req.body;
    
    const sql = `SELECT id_usuario, nombre, tipo_usuario, hash_contrasena FROM Usuarios WHERE correo_electronico = ?`;
    
    db.query(sql, [correo_electronico], (err, results) => {
        if (err) {
            console.error('Error al consultar usuario:', err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }
        
        const user = results[0];
        
        if (user.hash_contrasena === hash_contrasena) { 
            return res.json({ 
                message: 'Login exitoso', 
                user: {
                    id: user.id_usuario,
                    nombre: user.nombre,
                    rol: user.tipo_usuario
                }
            });
        } else {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }
    });
});

app.get('/api/eventosLista', (req, res) => {
  try {
    const sql = `SELECT id_evento, titulo, descripcion, fecha_evento, precio_entrada, rutaImagen, es_vip_exclusivo, activo FROM eventos WHERE fecha_evento >= now() AND activo = 1 ORDER BY fecha_evento`
    db.query(sql, (err,results) => {
        if (err) {
            console.error('Error al consultar usuario:', err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        res.json(results);
    });
  } catch (err) {
    console.error('Error al consultar eventos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
//STRIPE 
app.post('/checkout', async (req, res) => {
    const items = req.body.items.map((item) => {
        return {
            price_data:{
                currency : 'usd',
                produc_data: {
                    name : item.title,
                    image: [item.images]
                },
                unite_amount : item.price * 100,
            },
            quatity: item.qty
        }
    });

    try{
        const session = await stripe.checkout.sessions.create({
            ui_mode: "embedded",
            line_items: [... items],
            mode: 'payment',
            succes_url: `${YOUR_DOMAIN}/succes.html`,
            cancel_url: `${YOUR_DOMAIN}/cancel.html`
        })

        return res.json({
            clientSecret: session.client_secret
        });

    } catch (err){
        console.log(err);
        return res.status(500).json({ error: 'Error creating session' });
    }
});
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
      return_url: "http://localhost:4200/payment-result?session_id={CHECKOUT_SESSION_ID}",
      metadata: {
        asistentes: JSON.stringify(asistentes),
        email: email,
        nombreEvento: nombreEvento
      }
    });

    res.json({
      clientSecret: session.client_secret,
      sessionId: session.id
    });

  } catch (err) {
    console.error("Error creating session:", err);
    res.status(500).json({ error: "No se pudo crear la sesión de pago" });
  }
});

app.get("/checkout/session/:id", async (req, res) => {
    try {
        const sessionId = req.params.id;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.json({
            status: session.status,
            payment_status: session.payment_status,
            customer_email: session.customer_details?.email,
            amount_total: session.amount_total,
            currency: session.currency
        });

    } catch (error) {
        console.error("Error retrieving session:", error);
        res.status(500).json({ error: "No se pudo obtener la sesión" });
    }
});

app.post("/save-purchase", (req, res) => {
  const { asistentes, amount, id_usuario, correo_usuario, nombre_usuario, nombreEvento} = req.body;

  if (!asistentes || asistentes.length === 0) {
    return res.status(400).json({ error: "No hay asistentes" });
  }

  // Guardar primero el pedido
  const sqlPedido = `
    INSERT INTO pedidosentradas (id_usuario, monto_total, estado_pago, metodo_pago)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sqlPedido, [id_usuario, amount, "pagado", "stripe"], (err, result) => {
    if (err) {
      console.error("Error al crear pedido:", err);
      return res.status(500).json({ error: "Error creando pedido" });
    }

    const pedidoId = result.insertId;

    //Insertar cada entrada con ese pedidoId
    const sqlEntrada = `
      INSERT INTO entradas 
      (id_pedido_entrada, id_evento, id_usuario_asistente, codigo_qr, precio_pagado, fecha_compra, estado)
      VALUES (?, ?, ?, ?, ?, NOW(), ?)
    `;

    asistentes.forEach(as => {
      const values = [
        pedidoId,                          
        as.id_evento,
        id_usuario,
        "QR-" + pedidoId + "-" + uuidv4(),
        amount,
        "completado"
      ];

      db.query(sqlEntrada, values, (err) => {
        if (err){
          console.error("Error al guardar entrada:", err) 
          return;
        }
        const nombreEventoIndividual = as.nombre_evento;
        mensajeCompra(correo_usuario, nombre_usuario, nombreEventoIndividual);
      });
    });
    // 3️⃣ Respuesta final
    res.json({ success: true, pedidoId });
  });
});


app.get("/checkout/session-status", async (req, res) => {
  const { session_id } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.json({
      status: session.status,              // complete | open | expired
      amount: session.amount_total / 100,  // convertir a soles
      currency: session.currency,
      metadata: session.metadata
    });

  } catch (err) {
    console.error("Error consultando session:", err);
    res.status(400).json({ error: "No se pudo obtener la sesión" });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});