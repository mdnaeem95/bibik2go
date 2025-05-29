// scripts/hash-password.js
import bcrypt from 'bcrypt';
console.log(await bcrypt.hash('yourAdminPassword', 10));