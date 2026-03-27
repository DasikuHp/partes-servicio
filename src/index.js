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

// Servir estáticos
const publicPath = path.join(__dirname, '..', 'public');
const uploadsPath = path.join(__dirname, '..', 'uploads');

app.use(express.static(publicPath));
app.use('/uploads', express.static(uploadsPath));

// Montar rutas protegidas
app.use('/api', authMiddleware, partesRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'partes.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Partes API corriendo en puerto ' + PORT);
  console.log('📁 Sirviendo public desde: ' + publicPath);
  console.log('📁 Uploads desde: ' + uploadsPath);
});
