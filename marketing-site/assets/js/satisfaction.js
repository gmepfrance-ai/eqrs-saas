/* GMEP — satisfaction.js : génération des échelles 1-10 + soumission du questionnaire */
'use strict';

(function () {
  // ─── Génère les boutons 1-10 pour chaque groupe de notation ───
  document.querySelectorAll('.rating-nums').forEach(function (container) {
    var name = container.parentElement.dataset.name;
    var html = '';
    for (var n = 1; n <= 10; n++) {
      html += '<label>'
        + '<input type="radio" name="' + name + '" value="' + n + '" aria-label="Note ' + n + ' sur 10">'
        + '<span class="num-btn">' + n + '</span>'
        + '</label>';
    }
    container.innerHTML = html;
  });

  // ─── Soumission du formulaire ───
  var form = document.getElementById('survey-form');
  if (!form) return;

  var btn = document.getElementById('survey-btn');
  var okMsg = document.getElementById('survey-success');
  var errMsg = document.getElementById('survey-error');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    okMsg.hidden = true;
    errMsg.hidden = true;

    // Honeypot : si rempli, on ignore silencieusement
    var hp = form.querySelector('#hp-website');
    if (hp && hp.value) return;

    var fd = new FormData(form);
    var payload = {};
    fd.forEach(function (v, k) { payload[k] = v; });

    // Validation : au moins une note ou un retour texte
    var hasNote = ['q_pertinence', 'q_prise_en_main', 'q_clarte_resultats', 'q_exports',
      'q_documentation', 'q_stabilite', 'q_intention_usage', 'q_recommandation']
      .some(function (q) { return payload[q]; });
    var hasText = ['logiciels_testes', 'cas_usage', 'points_forts', 'difficultes', 'ameliorations']
      .some(function (t) { return (payload[t] || '').trim(); });

    if (!hasNote && !hasText) {
      errMsg.querySelector('strong').nextSibling.textContent = ' Veuillez attribuer au moins une note ou renseigner un retour avant de transmettre.';
      errMsg.hidden = false;
      errMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';

    fetch('/api/satisfaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function () {
        form.hidden = true;
        okMsg.hidden = false;
        okMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = 'Transmettre mon questionnaire';
        errMsg.hidden = false;
        errMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
  });
})();
