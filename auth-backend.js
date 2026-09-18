// Dodaj to do swojego głównego pliku serwera (tam gdzie masz express).
// Jeśli nie masz express: npm install express

const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const USERS_FILE = path.join(__dirname, "users.txt");

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return fs.readFileSync(USERS_FILE, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map(line => {
      const [nick, email, passHash] = line.split("|");
      return { nick, email, passHash };
    });
}

function saveUser(nick, email, passHash) {
  fs.appendFileSync(USERS_FILE, `${nick}|${email}|${passHash}\n`);
}

// Podłącz to w swoim serwerze, np.:
// const authRouter = require("./auth-backend");
// app.use(express.json());
// app.use(authRouter);

const router = express.Router();

router.post("/register", (req, res) => {
  const { nick, email, password } = req.body;
  if (!nick || !email || !password) {
    return res.json({ ok: false, error: "Brakuje danych" });
  }
  const users = loadUsers();
  if (users.find(u => u.nick === nick)) {
    return res.json({ ok: false, error: "Nick zajęty" });
  }
  saveUser(nick, email, hashPassword(password));
  res.json({ ok: true });
});

router.post("/login", (req, res) => {
  const { nick, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.nick === nick);
  if (!user || user.passHash !== hashPassword(password)) {
    return res.json({ ok: false, error: "Zły nick lub hasło" });
  }
  res.json({ ok: true });
});

module.exports = router;
