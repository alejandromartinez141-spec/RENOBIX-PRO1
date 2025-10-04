// server.js
const express = require("express");
const path = require("path");
const app = express();

// Sirve el contenido estático desde la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Puerto dinámico (Vercel usa uno automático)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
