// scripts/hash-password.js
import bcrypt from 'bcrypt';

(async () => {
  console.log(await bcrypt.hash('admin123', 10));
})();
