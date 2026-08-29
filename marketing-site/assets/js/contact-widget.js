/* GMEP — contact-widget.js : point de contact humain dans le tunnel de vente
 *
 * Usage :
 *   <button data-gmep-contact data-tool="Pack multi-outils">Réserver un appel</button>
 *
 * Au clic, ouvre une fenêtre modale avec un formulaire court (nom, email,
 * téléphone, message). L'envoi appelle POST /api/contact-request sur
 * app.gmep-france.eu (Resend), avec repli automatique sur mailto: si l'appel
 * réseau échoue, pour ne jamais perdre une demande.
 */
(function () {
  'use strict';

  const APP_BASE = (typeof window.GMEP_APP_BASE === 'string') ? window.GMEP_APP_BASE : 'https://app.gmep-france.eu';
  const FALLBACK_EMAIL = 'gmep.france@gmail.com';

  let modalEl = null;

  function buildModal() {
    const wrap = document.createElement('div');
    wrap.id = 'gmep-contact-modal';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = `
      <div class="gmep-cm-overlay" data-close></div>
      <div class="gmep-cm-panel" role="dialog" aria-modal="true" aria-labelledby="gmep-cm-title">
        <button type="button" class="gmep-cm-close" data-close aria-label="Fermer">&times;</button>
        <h3 id="gmep-cm-title">Une question avant de souscrire ?</h3>
        <p class="gmep-cm-sub">Décrivez votre besoin, nous vous rappelons personnellement sous 24 à 48h ouvrées — sans engagement.</p>
        <form id="gmep-cm-form">
          <input type="hidden" name="tool" id="gmep-cm-tool" value="">
          <input type="hidden" name="source" id="gmep-cm-source" value="">
          <div class="gmep-cm-row">
            <label for="gmep-cm-name">Nom *</label>
            <input type="text" id="gmep-cm-name" name="name" required>
          </div>
          <div class="gmep-cm-row">
            <label for="gmep-cm-email">Email *</label>
            <input type="email" id="gmep-cm-email" name="email" required placeholder="prenom.nom@bureau-etudes.fr">
          </div>
          <div class="gmep-cm-row">
            <label for="gmep-cm-phone">Téléphone (optionnel)</label>
            <input type="tel" id="gmep-cm-phone" name="phone">
          </div>
          <div class="gmep-cm-row">
            <label for="gmep-cm-message">Votre question (optionnel)</label>
            <textarea id="gmep-cm-message" name="message" rows="3" placeholder="Ex : quel outil pour mon cas, tarif pack multi-outils, facturation..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-block" id="gmep-cm-submit">Demander à être rappelé</button>
          <p class="gmep-cm-note">En soumettant ce formulaire, vous acceptez que vos données soient utilisées pour répondre à votre demande. Conformité RGPD — voir <a href="mentions-legales.html">mentions légales</a>.</p>
        </form>
        <div id="gmep-cm-success" hidden>
          <p><strong>Merci, votre demande est bien enregistrée.</strong></p>
          <p>Nous vous recontactons sous 24 à 48h ouvrées, par e-mail ou téléphone.</p>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    return wrap;
  }

  function openModal(tool, source) {
    if (!modalEl) modalEl = buildModal();
    modalEl.querySelector('#gmep-cm-tool').value = tool || '';
    modalEl.querySelector('#gmep-cm-source').value = source || (window.location ? window.location.pathname : '');
    const sub = modalEl.querySelector('.gmep-cm-sub');
    if (tool) {
      sub.textContent = `Une question sur « ${tool} » avant de souscrire ? Décrivez votre besoin, nous vous rappelons sous 24 à 48h ouvrées.`;
    }
    modalEl.classList.add('open');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      const nameInput = modalEl.querySelector('#gmep-cm-name');
      if (nameInput) nameInput.focus();
    }, 50);
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-gmep-contact]');
    if (trigger) {
      e.preventDefault();
      openModal(trigger.getAttribute('data-tool') || '', trigger.getAttribute('data-source') || '');
      return;
    }
    if (modalEl && e.target.closest('[data-close]') && modalEl.contains(e.target.closest('[data-close]'))) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalEl && modalEl.classList.contains('open')) closeModal();
  });

  document.addEventListener('submit', function (e) {
    if (!modalEl || e.target.id !== 'gmep-cm-form') return;
    e.preventDefault();
    const form = e.target;
    const submitBtn = modalEl.querySelector('#gmep-cm-submit');
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      message: form.message.value.trim(),
      tool: form.tool.value,
      source: form.source.value
    };
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    fetch(APP_BASE + '/api/contact-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (res) {
      if (!res.ok) throw new Error('http_' + res.status);
      return res.json();
    }).then(function () {
      form.hidden = true;
      modalEl.querySelector('#gmep-cm-success').hidden = false;
    }).catch(function () {
      // Repli fiable : ouvre le client mail avec les infos pré-remplies
      const subject = encodeURIComponent('Demande de rappel — ' + (data.name || 'site GMEP'));
      const body = encodeURIComponent(
        'Nom : ' + data.name + '\nEmail : ' + data.email + '\nTéléphone : ' + data.phone +
        '\nOutil concerné : ' + data.tool + '\nMessage : ' + data.message
      );
      window.location.href = 'mailto:' + FALLBACK_EMAIL + '?subject=' + subject + '&body=' + body;
      form.hidden = true;
      modalEl.querySelector('#gmep-cm-success').hidden = false;
    }).finally(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Demander à être rappelé';
    });
  });

  window.GmepContact = { open: openModal, close: closeModal };
})();
