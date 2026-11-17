/* Guardado en la nube con Firebase (Firestore). Los datos viven fuera del navegador:
   se ven igual en el celu u otro PC. Solo tu cuenta de Google puede guardar cambios. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const cfg = window.FIREBASE_CONFIG;
if (cfg && cfg.apiKey && cfg.apiKey.indexOf("PEGA") !== 0) start();
else console.info("Firebase sin configurar: se guarda solo en este navegador.");

function start() {
  const app = initializeApp(cfg), auth = getAuth(app), fs = getFirestore(app);
  const CH = 250000;
  let user = null, pulled = false, remoteEmpty = false, applying = false;
  let timer = null, saving = false, dirty = false, warned = false, lastAt = 0;

  const btn = document.createElement("button");
  btn.className = "tool"; btn.type = "button"; btn.dataset.action = "cloud"; btn.textContent = "☁";
  btn.setAttribute("aria-label", "Nube");
  document.querySelector(".tools").prepend(btn);
  function paint() {
    btn.title = user ? "Nube: sesión iniciada (" + user.email + "). Clic para salir" : "Iniciar sesión para guardar en la nube";
    btn.style.color = user ? "#2a9d5c" : "";
  }
  paint();

  document.addEventListener("click", function (e) {
    if (!e.target.closest('[data-action="cloud"]')) return;
    if (user) signOut(auth);
    else signInWithPopup(auth, new GoogleAuthProvider()).catch(function () { App.toast("No se pudo iniciar sesión"); });
  });

  async function pull(force) {
    const idx = await getDoc(doc(fs, "archive", "index"));
    if (!idx.exists()) return false;
    if (!force && idx.data().at === lastAt) return true;
    const n = idx.data().n, parts = [];
    for (let i = 0; i < n; i++) {
      const p = await getDoc(doc(fs, "archive", "p" + i));
      if (!p.exists()) throw new Error("incompleto");
      parts.push(p.data().t);
    }
    applying = true;
    try { Store.importData(parts.join("")); } finally { applying = false; }
    lastAt = idx.data().at;
    App.render();
    return true;
  }

  async function push() {
    if (saving) { dirty = true; return; }
    saving = true; dirty = false;
    try {
      const str = Store.exportData(), parts = [];
      for (let i = 0; i < str.length; i += CH) parts.push(str.slice(i, i + CH));
      if (!parts.length) parts.push("");
      for (let i = 0; i < parts.length; i++) await setDoc(doc(fs, "archive", "p" + i), { t: parts[i] });
      lastAt = Date.now();
      await setDoc(doc(fs, "archive", "index"), { n: parts.length, at: lastAt });
    } catch (e) {
      App.toast("No se pudo guardar en la nube. Exporta un respaldo por seguridad.");
    }
    saving = false;
    if (dirty) push();
  }

  function queue() {
    if (applying) return;
    if (!user) {
      if (!warned) { warned = true; App.toast("Para guardar en la nube, inicia sesión con ☁"); }
      return;
    }
    if (!pulled) return;
    clearTimeout(timer);
    timer = setTimeout(function () { timer = null; push(); }, 1200);
  }

  ["mutate", "reset", "importData"].forEach(function (name) {
    const orig = Store[name];
    Store[name] = function () { const r = orig.apply(Store, arguments); queue(); return r; };
  });

  onAuthStateChanged(auth, function (u) {
    user = u; paint();
    if (u && pulled && remoteEmpty) { remoteEmpty = false; push(); }
  });

  pull(true).then(function (found) {
    pulled = true; remoteEmpty = !found;
    if (user && remoteEmpty) { remoteEmpty = false; push(); }
  }).catch(function () { App.toast("No se pudo cargar de la nube: se muestra lo guardado en este navegador."); });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && pulled && !timer && !saving && !dirty) pull(false).catch(function () {});
  });
}
