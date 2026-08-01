/* ════════════════════════════════════════════════════════════
   GMEP — Gestion du quota démo 8 jours
   - Stocke la date de démarrage en localStorage + cookie
   - Bloque la génération PDF passé 8 jours
   - Modal email obligatoire avant la 1re génération
   ════════════════════════════════════════════════════════════ */

const QUOTA_KEY = "gmep_demo_start";
const QUOTA_EMAIL = "gmep_demo_email";
const QUOTA_DURATION_MS = 8 * 24 * 3600 * 1000; // 8 jours

// ─── Endpoint serveur (à brancher par l'opérateur) ───
// Remplacer ci-dessous par votre endpoint Formspree / Google Sheet / Airtable / Make
// Exemple Formspree : "https://formspree.io/f/xxxxxxxx"
const REMOTE_ENDPOINT = ""; // ← à compléter

// ─── Lecture / écriture cookie (fallback si localStorage purgé) ───
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 3600 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}
function getCookie(name) {
  const v = document.cookie.split('; ').find(r => r.startsWith(name + '='));
  return v ? decodeURIComponent(v.split('=')[1]) : null;
}

// ─── Récupère la date de démarrage (priorité localStorage, fallback cookie) ───
function getDemoStart() {
  let v = null;
  try { v = localStorage.getItem(QUOTA_KEY); } catch(e) {}
  if (!v) v = getCookie(QUOTA_KEY);
  return v ? parseInt(v, 10) : null;
}
function getDemoEmail() {
  let v = null;
  try { v = localStorage.getItem(QUOTA_EMAIL); } catch(e) {}
  if (!v) v = getCookie(QUOTA_EMAIL);
  return v || null;
}

// ─── Sauvegarde de la date + email ───
function saveDemoStart(email) {
  const now = Date.now();
  try {
    localStorage.setItem(QUOTA_KEY, String(now));
    localStorage.setItem(QUOTA_EMAIL, email);
  } catch(e) {}
  setCookie(QUOTA_KEY, String(now), 8);
  setCookie(QUOTA_EMAIL, email, 8);
}

// ─── État du quota ───
function checkQuota() {
  const start = getDemoStart();
  if (!start) return { state: "new" };
  const elapsed = Date.now() - start;
  if (elapsed >= QUOTA_DURATION_MS) {
    return { state: "expired", expiredAt: start + QUOTA_DURATION_MS };
  }
  const remaining = QUOTA_DURATION_MS - elapsed;
  const daysLeft = Math.ceil(remaining / (24 * 3600 * 1000));
  return { state: "active", start, daysLeft, remaining, email: getDemoEmail() };
}

// ─── Modal email (1re génération) ───
function showEmailModal() {
  return new Promise((resolve, reject) => {
    const modal = document.getElementById("email-modal");
    const form = document.getElementById("email-form");
    const input = document.getElementById("email-input");
    const company = document.getElementById("company-input");
    const closeBtn = document.getElementById("email-close");
    const errBox = document.getElementById("email-error");

    if (!modal) return reject(new Error("Modal introuvable"));

    errBox.textContent = "";
    modal.classList.add("active");
    setTimeout(() => input.focus(), 100);

    const onClose = () => {
      modal.classList.remove("active");
      cleanup();
      reject(new Error("Annulé"));
    };
    const onSubmit = async (ev) => {
      ev.preventDefault();
      const email = input.value.trim();
      const co = company.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errBox.textContent = "Adresse e-mail invalide.";
        return;
      }
      errBox.textContent = "Enregistrement…";

      // Envoi optionnel à l'endpoint serveur (fire-and-forget si pas configuré)
      if (REMOTE_ENDPOINT) {
        try {
          await fetch(REMOTE_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
              email,
              company: co,
              source: "GMEP Démo Rabattement",
              date: new Date().toISOString()
            })
          });
        } catch(e) {
          // On laisse passer même si l'envoi échoue, mais on log
          console.warn("Envoi email échoué :", e);
        }
      }

      saveDemoStart(email);
      modal.classList.remove("active");
      cleanup();
      resolve({ email, company: co });
    };

    function cleanup() {
      form.removeEventListener("submit", onSubmit);
      closeBtn.removeEventListener("click", onClose);
    }
    form.addEventListener("submit", onSubmit);
    closeBtn.addEventListener("click", onClose);
  });
}

// ─── Échappement HTML (défense XSS) ───
function escQ(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }

// ─── Bannière de statut (toujours affichée en mode démo) ───
function refreshQuotaBanner() {
  const banner = document.getElementById("quota-banner");
  const lock = document.getElementById("lock-overlay");
  if (!banner) return;
  const q = checkQuota();
  if (q.state === "new") {
    banner.innerHTML = `<strong>Mode démonstration</strong> — La 1re génération PDF déclenchera le démarrage de votre essai gratuit de 8 jours.`;
    banner.className = "quota-banner ok";
    if (lock) lock.classList.remove("open");
  } else if (q.state === "active") {
    const date_fin = new Date(q.start + QUOTA_DURATION_MS).toLocaleDateString("fr-FR");
    banner.innerHTML = `<strong>Essai actif</strong> — ${q.daysLeft} jour${q.daysLeft > 1 ? "s" : ""} restant${q.daysLeft > 1 ? "s" : ""} (jusqu'au ${date_fin}). Compte&nbsp;: ${escQ(q.email || "")}.`;
    banner.className = "quota-banner ok";
    if (lock) lock.classList.remove("open");
  } else {
    const checkoutURL = `https://www.gmep-france.eu/#/register?plan=rabattement_annual&country=${encodeURIComponent(document.getElementById('buyer-country')?.value || 'FR')}`;
    banner.innerHTML = `<strong>Essai expiré</strong> — Votre période de démonstration de 8 jours est terminée. <a href="${checkoutURL}" target="_blank" rel="noopener">💳 Souscrire en ligne (Stripe) →</a>`;
    banner.className = "quota-banner expired";
    if (lock) lock.classList.add("open");
  }
}

// ─── Garde principale : à appeler avant chaque génération PDF ───
async function ensureCanGeneratePdf() {
  const q = checkQuota();
  if (q.state === "expired") {
    const lock = document.getElementById("lock-overlay");
    if (lock) lock.classList.add("open");
    throw new Error("Essai expiré");
  }
  if (q.state === "new") {
    // Affiche modal email avant 1re génération
    await showEmailModal();
    refreshQuotaBanner();
  }
  return true;
}

window.GMEP_Quota = {
  checkQuota,
  ensureCanGeneratePdf,
  refreshQuotaBanner,
  showEmailModal,
  saveDemoStart  // exposé pour debug/admin
};
