const crypto = require('crypto');

console.log('Generando tokens seguros para el archivo .env...\n');
console.log(`TOKEN_RUBEN=${crypto.randomUUID()}`);
console.log(`TOKEN_TONO=${crypto.randomUUID()}`);
console.log('\nCopia estas líneas y pégalas en tu archivo .env para habilitar el login.');
