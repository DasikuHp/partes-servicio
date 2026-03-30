const session = require('express-session');

// Middleware de sesión
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'partes-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000 // 8 horas
  }
});

// Middleware de protección: comprueba que existe sesión con tech
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.tech) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
};

module.exports = { sessionMiddleware, requireAuth };
