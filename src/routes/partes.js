const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { db } = require('../db'); // Importa la instancia db del nuevo export { db, initDb }
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear la ruta de subidas usando __dirname
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Columnas sin pdf_base64 para no saturar las respuestas
const COLUMNS_WITHOUT_PDF = `
  id, tech, empresa, direccion, contacto, telefono, 
  email_cliente, email_para, email_cc, fecha, hora_entrada, 
  hora_salida, total_horas, desplazamiento, descripcion, 
  pendiente, mats, fotos, status, created_at, updated_at
`;

// GET /api/partes
router.get('/partes', (req, res) => {
  try {
    const { tech, status, q } = req.query;
    
    let sql = `SELECT ${COLUMNS_WITHOUT_PDF} FROM partes WHERE 1=1`;
    const params = [];

    if (tech) {
      sql += ` AND tech = ?`;
      params.push(tech);
    }
    
    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }

    if (q) {
      sql += ` AND (empresa LIKE ? OR descripcion LIKE ? OR fecha LIKE ?)`;
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ` ORDER BY created_at DESC`;

    const stmt = db.prepare(sql);
    let partes = stmt.all(...params);
    
    // Parse JSON fields
    partes = partes.map(p => {
      if (p.mats) p.mats = JSON.parse(p.mats);
      if (p.fotos) p.fotos = JSON.parse(p.fotos);
      return p;
    });
    
    res.json(partes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/partes
router.post('/partes', (req, res) => {
  try {
    const id = crypto.randomUUID();
    const data = req.body;
    
    if (!data.tech) {
      return res.status(400).json({ error: "El campo 'tech' es obligatorio" });
    }

    const matsStr = data.mats ? JSON.stringify(data.mats) : null;
    const fotosData = data.fotos !== undefined ? data.fotos : data.photoUrls;
    const fotosStr = fotosData ? JSON.stringify(fotosData) : null;

    const sql = `
      INSERT INTO partes (
        id, tech, empresa, direccion, contacto, telefono, 
        email_cliente, email_para, email_cc, fecha, hora_entrada, 
        hora_salida, total_horas, desplazamiento, descripcion, 
        pendiente, mats, fotos, status, pdf_base64
      ) VALUES (
        @id, @tech, @empresa, @direccion, @contacto, @telefono,
        @email_cliente, @email_para, @email_cc, @fecha, @hora_entrada,
        @hora_salida, @total_horas, @desplazamiento, @descripcion,
        @pendiente, @mats, @fotos, @status, @pdf_base64
      )
    `;

    const stmt = db.prepare(sql);
    stmt.run({
      id,
      tech: data.tech,
      empresa: data.empresa || null,
      direccion: data.direccion || null,
      contacto: data.contacto || null,
      telefono: data.telefono || null,
      email_cliente: data.email_cliente || data.emailCliente || null,
      email_para: data.email_para || data.emailPara || null,
      email_cc: data.email_cc || data.emailCC || null,
      fecha: data.fecha || null,
      hora_entrada: data.hora_entrada || data.horaEntrada || null,
      hora_salida: data.hora_salida || data.horaSalida || null,
      total_horas: data.total_horas || data.totalHoras || null,
      desplazamiento: data.desplazamiento || null,
      descripcion: data.descripcion || data.desc || null,
      pendiente: data.pendiente || null,
      mats: matsStr,
      fotos: fotosStr,
      status: data.status || 'draft',
      pdf_base64: data.pdf_base64 || null
    });

    const createdSql = `SELECT ${COLUMNS_WITHOUT_PDF} FROM partes WHERE id = ?`;
    let created = db.prepare(createdSql).get(id);
    
    if (created.mats) created.mats = JSON.parse(created.mats);
    if (created.fotos) created.fotos = JSON.parse(created.fotos);

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/partes/:id
router.put('/partes/:id', (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    
    // Check if exists
    const checkStmt = db.prepare(`SELECT id FROM partes WHERE id = ?`);
    if (!checkStmt.get(id)) {
      return res.status(404).json({ error: "Parte no encontrado" });
    }

    const updates = [];
    const params = {};

    const allowedFields = [
      'tech', 'empresa', 'direccion', 'contacto', 'telefono', 
      'email_cliente', 'email_para', 'email_cc', 'fecha', 'hora_entrada', 
      'hora_salida', 'total_horas', 'desplazamiento', 'descripcion', 
      'pendiente', 'status', 'pdf_base64'
    ];

    const fieldMap = {
      email_cliente: data.emailCliente,
      email_para: data.emailPara,
      email_cc: data.emailCC,
      hora_entrada: data.horaEntrada,
      hora_salida: data.horaSalida,
      total_horas: data.totalHoras,
      descripcion: data.desc
    };

    allowedFields.forEach(field => {
      const val = data[field] !== undefined ? data[field] : fieldMap[field];
      if (val !== undefined) {
        updates.push(`${field} = @${field}`);
        params[field] = val;
      }
    });

    if (data.mats !== undefined) {
      updates.push(`mats = @mats`);
      params.mats = data.mats ? JSON.stringify(data.mats) : null;
    }

    const fotosVal = data.fotos !== undefined ? data.fotos : data.photoUrls;
    if (fotosVal !== undefined) {
      updates.push(`fotos = @fotos`);
      params.fotos = fotosVal ? JSON.stringify(fotosVal) : null;
    }

    if (updates.length > 0) {
      updates.push(`updated_at = datetime('now')`);
      params.id = id;

      const sql = `UPDATE partes SET ${updates.join(', ')} WHERE id = @id`;
      const stmt = db.prepare(sql);
      stmt.run(params);
    }

    const updatedSql = `SELECT ${COLUMNS_WITHOUT_PDF} FROM partes WHERE id = ?`;
    let updated = db.prepare(updatedSql).get(id);
    
    if (updated.mats) updated.mats = JSON.parse(updated.mats);
    if (updated.fotos) updated.fotos = JSON.parse(updated.fotos);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/partes/:id
router.get('/partes/:id', (req, res) => {
  try {
    const stmt = db.prepare(`SELECT * FROM partes WHERE id = ?`);
    let parte = stmt.get(req.params.id);
    
    if (!parte) {
      return res.status(404).json({ error: "Parte no encontrado" });
    }

    if (parte.mats) parte.mats = JSON.parse(parte.mats);
    if (parte.fotos) parte.fotos = JSON.parse(parte.fotos);

    res.json(parte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/partes/:id
router.delete('/partes/:id', (req, res) => {
  try {
    const stmt = db.prepare(`DELETE FROM partes WHERE id = ?`);
    const info = stmt.run(req.params.id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: "Parte no encontrado" });
    }

    res.json({ deleted: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configurar transporte SMTP con configuración robusta para SMTP externo
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
});

// POST /api/partes/:id/send
router.post('/partes/:id/send', async (req, res) => {
  const id = req.params.id;
  const { para, cc, pdfBase64, filename } = req.body;

  // 1. Buscar el parte en SQLite
  const stmt = db.prepare(`SELECT empresa, fecha FROM partes WHERE id = ?`);
  const parte = stmt.get(id);

  if (!parte) {
    return res.status(404).json({ error: "Parte no encontrado" });
  }

  // 2. SIEMPRE guardar PDF y marcar como enviado ANTES de intentar email
  const updateStmt = db.prepare(`
    UPDATE partes 
    SET pdf_base64 = @pdf_base64, 
        status = 'sent', 
        updated_at = datetime('now') 
    WHERE id = @id
  `);
  
  updateStmt.run({
    id: id,
    pdf_base64: pdfBase64 || null
  });

  // 3. Preparar array de CC
  const ccArray = Array.isArray(cc) ? cc : (cc ? [cc] : []);

  // Limpiar base64
  const pureBase64 = pdfBase64 ? (pdfBase64.includes(',') ? pdfBase64.split(',')[1] : pdfBase64) : '';

  // 4. Parámetros del Email
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: para,
    cc: ccArray,
    subject: `Parte de Servicio - ${parte.empresa || 'Cliente'}`,
    html: "<p>Adjunto parte de servicio. Firmado digitalmente.</p>",
    attachments: []
  };
  
  if (parte.fecha) mailOptions.subject += ` - ${parte.fecha}`;

  if (pureBase64) {
    mailOptions.attachments.push({
      filename: filename || 'parte-servicio.pdf',
      content: pureBase64,
      encoding: 'base64',
      contentType: 'application/pdf'
    });
  }

  // 5. Intentar enviar email — si falla, NO devolver 500
  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, id, pdfBase64: pdfBase64 || null, emailSent: true });
  } catch (emailError) {
    console.error('[SMTP Error]', emailError.message);
    res.json({ 
      success: true, 
      id, 
      pdfBase64: pdfBase64 || null, 
      emailSent: false, 
      emailError: emailError.message 
    });
  }
});

// POST /api/upload
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ url: '/uploads/' + req.file.filename });
});

module.exports = router;
