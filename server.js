const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET || 'cambia_esto_por_un_secreto_largo';
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Crear carpeta y archivo de usuarios si no existen
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));

// 📁 Funciones de utilidad
function readUsers() {
  const raw = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(raw || '[]');
}
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// 🛡️ Middleware de autenticación
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// 📌 Registrar usuario
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Faltan campos' });

  const users = readUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: 'Usuario ya existe' });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = {
    id: Date.now().toString(),
    name: name || '',
    email,
    passwordHash: hash,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  writeUsers(users);

  const token = generateToken({ id: user.id, email: user.email, name: user.name });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// 📌 Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

  const token = generateToken({ id: user.id, email: user.email, name: user.name });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// 📌 Obtener perfil del usuario
app.get('/api/me', authMiddleware, (req, res) => {
  const users = readUsers();
  const u = users.find(x => x.id === req.user.id);
  if (!u) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json({ id: u.id, email: u.email, name: u.name, createdAt: u.createdAt });
});

// 📁 Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// 📁 Enviar index.html por defecto
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🚀 Exportar app para Vercel (IMPORTANTE)
module.exports = app;
