const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// POST /api/auth/login
router.post('/auth/login', (req, res) => {
  try {
    const { tech, password } = req.body;

    if (!tech || !password) {
      return res.status(400).json({ error: 'Faltan campos tech y/o password' });
    }

    if (tech !== 'ruben' && tech !== 'tono') {
      return res.status(400).json({ error: 'Técnico no válido' });
    }

    const hashEnv = tech === 'ruben' ? process.env.HASH_RUBEN : process.env.HASH_TONO;

    if (!hashEnv) {
      return res.status(500).json({ error: 'Hash no configurado en el servidor' });
    }

    const valid = bcrypt.compareSync(password, hashEnv);

    if (!valid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    req.session.tech = tech;
    res.json({ ok: true, tech });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout
router.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ ok: true });
  });
});

// GET /api/auth/me
router.get('/auth/me', (req, res) => {
  if (req.session && req.session.tech) {
    return res.json({ tech: req.session.tech });
  }
  res.status(401).json({ error: 'No autenticado' });
});

module.exports = router;
