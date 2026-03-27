const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'partes.db');

// Asegura que el directorio data exista
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Inicializar SQLite nativo (node:sqlite)
const db = new DatabaseSync(DB_PATH);

// Configurar modo WAL y claves foráneas en la misma instancia db nativa
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log(`[DB] Native SQLite database ready at ${DB_PATH}`);
}

module.exports = { db, initDb };
