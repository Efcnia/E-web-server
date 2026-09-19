const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const USERS_FILE = path.join(__dirname, "users.txt");
const REMEMBER_FILE = path.join(__dirname, "remembered.txt");

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

function loadRemembered() {
  if (!fs.existsSync(REMEMBER_FILE)) return [];
  return fs.readFileSync(REMEMBER_FILE, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map(line => {
      const [token, nick, date] = line.split("|");
      return { token, nick, date };
    });
}

function saveRememberToken(token, nick) {
  fs.appendFileSync(REMEMBER_FILE, `${token}|${nick}|${new Date().toISOString()}\n`);
}

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
  const { nick, password, remember } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.nick === nick);
  if (!user || user.passHash !== hashPassword(password)) {
    return res.json({ ok: false, error: "Zły nick lub hasło" });
  }

  let token = null;
  if (remember) {
    token = crypto.randomBytes(24).toString("hex");
    saveRememberToken(token, nick);
  }

  res.json({ ok: true, token });
});

router.post("/remember-check", (req, res) => {
  const { token } = req.body;
  if (!token) return res.json({ ok: false });

  const remembered = loadRemembered();
  const entry = remembered.find(r => r.token === token);
  if (!entry) return res.json({ ok: false });

  res.json({ ok: true, nick: entry.nick });
});

module.exports = router;
