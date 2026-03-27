require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const partesRouter = require('./routes/partes');
const authMiddleware = require('./middleware/auth');
const { initDb } = require('./db');

// Inicializar la base de datos y esquema
initDb();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir estáticos con dirname explícito
app.use('/', express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Montar rutas protegidas
app.use('/api', authMiddleware, partesRouter);

// Start server
app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`);
});
