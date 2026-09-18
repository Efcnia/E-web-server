const express = require('express');
const { status } = require('minecraft-server-util');
const path = require('path');

const app = express();

const MC_HOST = 'e-server-mc.duckdns.org';
const MC_PORT = 25565;

app.use(express.json());
app.use(express.static(__dirname)); // serwuje index.html, logowanie.js itd. z GŁÓWNEGO folderu

const authRouter = require('./auth-backend');
app.use(authRouter);

app.get('/status', async (req, res) => {
  try {
    const result = await status(MC_HOST, MC_PORT, { timeout: 5000 });
    res.json({
      online: true,
      players: {
        online: result.players.online,
        max: result.players.max,
        list: result.players.sample ? result.players.sample.map(p => p.name) : []
      },
      version: result.version.name,
      motd: result.motd.clean,
    });
  } catch (err) {
    res.json({ online: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serwer działa: http://localhost:${PORT}`);
});
