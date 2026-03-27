PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS partes (
  id            TEXT PRIMARY KEY,                          -- UUID v4
  tech          TEXT NOT NULL CHECK(tech IN ('ruben','tono')),
  empresa       TEXT,
  direccion     TEXT,
  contacto      TEXT,
  telefono      TEXT,
  email_cliente TEXT,
  email_para    TEXT,
  email_cc      TEXT,
  fecha         TEXT,
  hora_entrada  TEXT,
  hora_salida   TEXT,
  total_horas   TEXT,
  desplazamiento TEXT,
  descripcion   TEXT,
  pendiente     TEXT,
  mats          TEXT,                                      -- JSON serializado
  fotos         TEXT,                                      -- JSON serializado (array de URLs)
  status        TEXT DEFAULT 'draft' CHECK(status IN ('draft','sent')),
  pdf_base64    TEXT,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);
