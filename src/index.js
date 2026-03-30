require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const partesRouter = require('./routes/partes');
const authRouter = require('./routes/auth');
const { sessionMiddleware, requireAuth } = require('./middleware/auth');
const { initDb } = require('./db');

// Inicializar la base de datos y esquema
initDb();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Sesiones (ANTES de las rutas)
app.use(sessionMiddleware);

// Servir estáticos
const publicPath = path.join(__dirname, '..', 'public');
const uploadsPath = path.join(__dirname, '..', 'uploads');

app.use(express.static(publicPath));
app.use('/uploads', express.static(uploadsPath));

// Rutas de auth (login/logout/me) — NO requieren auth
app.use('/api', authRouter);

// Rutas de partes — requieren auth
app.use('/api', requireAuth, partesRouter);

// Catch-all: servir partes.html para cualquier ruta no-API
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'partes.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Partes API corriendo en puerto ' + PORT);
  console.log('📁 Sirviendo public desde: ' + publicPath);
  console.log('📁 Uploads desde: ' + uploadsPath);
});
