const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const tokenRuben = process.env.TOKEN_RUBEN;
  const tokenTono = process.env.TOKEN_TONO;

  if (token && token === tokenRuben) {
    req.tech = 'ruben';
    next();
  } else if (token && token === tokenTono) {
    req.tech = 'tono';
    next();
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
