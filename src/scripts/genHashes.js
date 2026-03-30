const bcrypt = require('bcryptjs');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Uso: node genHashes.js PASSWORD_RUBEN PASSWORD_TONO');
  process.exit(1);
}

const hashRuben = bcrypt.hashSync(args[0], 12);
const hashTono = bcrypt.hashSync(args[1], 12);

console.log('');
console.log('Copia estas líneas en tu .env:');
console.log('');
console.log('HASH_RUBEN=' + hashRuben);
console.log('HASH_TONO=' + hashTono);
console.log('');
