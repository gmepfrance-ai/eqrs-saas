/* GMEP — nav.js : header responsive, dropdown, sélecteur langue */

(function () {
  'use strict';

  // ─── Redirection des routes app (#/...) vers app.gmep-france.eu ───
  // Le site marketing ne gère pas les routes SPA ; on redirige les hash
  // commençant par "#/" (ex. #/stats, #/login, #/dashboard) vers l'app.
  // Les ancres marketing (#tarifs, #contact) sont préservées.
  (function redirectAppHash() {
    const APP_BASE = 'https://app.gmep-france.eu/';
    const h = window.location.hash || '';
    if (h.indexOf('#/') === 0) {
      window.location.replace(APP_BASE + h);
      return;
    }
    window.addEventListener('hashchange', function () {
      const cur = window.location.hash || '';
      if (cur.indexOf('#/') === 0) {
        window.location.replace(APP_BASE + cur);
      }
    });
  })();

  // Burger menu (mobile)
  const burger = document.querySelector('.burger');
  const header = document.querySelector('.site-header');
  if (burger && header) {
    burger.addEventListener('click', function () {
      header.classList.toggle('menu-open');
      const expanded = header.classList.contains('menu-open');
      burger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  // Dropdown "Outils"
  document.querySelectorAll('.nav-dropdown').forEach(function (drop) {
    const trigger = drop.querySelector('.nav-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      // Fermer les autres
      document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
        if (d !== drop) d.classList.remove('open');
      });
      drop.classList.toggle('open');
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
        d.classList.remove('open');
      });
    }
  });

  // Sélecteur de langue : FR actif, EN/ES → toast "Traduction en cours"
  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const lang = btn.getAttribute('data-lang');
      if (lang === 'fr') return; // Déjà actif
      showToast('Traduction ' + (lang === 'en' ? 'anglaise' : 'espagnole') + ' en cours — disponible prochainement.');
    });
  });

  // Toast utilitaire
  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toast.classList.remove('visible');
    }, 3200);
  }
  window.GmepToast = showToast;

  // Lien actif (basé sur le chemin)
  const path = window.location.pathname.replace(/\/index\.html$/, '/');
  document.querySelectorAll('.nav-center a[href]').forEach(function (a) {
    const href = a.getAttribute('href');
    if (!href || href === '#' || href.startsWith('javascript:')) return;
    // Normalisation simple
    if (path.endsWith(href) || (href === '/' && (path === '/' || path === ''))) {
      a.classList.add('active');
    }
    // Cas /outils/*
    if (href.includes('/outils/') && path.includes('/outils/')) {
      a.classList.add('active');
    }
  });

})();
