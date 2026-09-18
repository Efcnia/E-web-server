import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC59aV-arTB6Ig9vcGoVgdfk2G-pOxPdsA",
  authDomain: "mc-status-da96f.firebaseapp.com",
  projectId: "mc-status-da96f",
  storageBucket: "mc-status-da96f.firebasestorage.app",
  messagingSenderId: "1056063813609",
  appId: "1:1056063813609:web:f00cbe4fbb6ee20b6c7d78"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

document.getElementById("btnOpenRegister").onclick = () => openModal("registerModal");
document.getElementById("btnOpenLogin").onclick = () => openModal("loginModal");
document.querySelectorAll(".closeModal").forEach(el => {
  el.onclick = () => closeModal(el.dataset.close);
});

document.getElementById("btnGoogle").onclick = () => {
  signInWithPopup(auth, googleProvider)
    .then(uc => {
      document.getElementById("userInfo").textContent = "Zalogowano: " + uc.user.email;
      closeModal("registerModal");
    })
    .catch(err => alert(err.message));
};

document.getElementById("btnRegister").onclick = async () => {
  const nick = document.getElementById("regNick").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  if (!nick || !email || !password) return alert("Uzupełnij wszystkie pola");

  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nick, email, password })
  });
  const data = await res.json();
  if (data.ok) {
    document.getElementById("userInfo").textContent = "Zarejestrowano: " + nick;
    closeModal("registerModal");
  } else {
    alert(data.error);
  }
};

document.getElementById("btnLogin").onclick = async () => {
  const nick = document.getElementById("loginNick").value;
  const password = document.getElementById("loginPassword").value;
  if (!nick || !password) return alert("Uzupełnij wszystkie pola");

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nick, password })
  });
  const data = await res.json();
  if (data.ok) {
    document.getElementById("userInfo").textContent = "Zalogowano: " + nick;
    closeModal("loginModal");
  } else {
    alert(data.error);
  }
};
