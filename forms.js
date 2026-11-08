(function () {
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    // Images : fondu à l'arrivée
    document.querySelectorAll('main img').forEach(function (img) {
      function done() { img.classList.add('is-loaded'); var w = img.closest('figure, .person-photo'); if (w) { w.style.animation = 'none'; w.style.background = 'none'; } }
      if (img.complete && img.naturalWidth) done(); else { img.addEventListener('load', done); img.addEventListener('error', done); }
    });
    // Blocs : apparition au défilement
    var sel = '.sec-head, .group, .split-copy, .split-img, .flow li, .simbox, .rv, .real, .person, .zones-mini-in, .faq details, .cta-box, .svc-list li, .text-blocks > div, .checks li, .aside-stack, .aside-box, .post, .table-wrap, .callback';
    var els = Array.prototype.slice.call(document.querySelectorAll('main ' + sel.split(', ').join(', main ')));
    els.forEach(function (el) {
      el.classList.add('reveal');
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--d', Math.min(sib, 5) * 0.07 + 's');
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      els.forEach(function (el) { io.observe(el); });
    } else { els.forEach(function (el) { el.classList.add('in'); }); }
    // Barre du bas : cachée sur le haut de page et quand on descend, visible quand on remonte ou qu'on s'arrête
    var bar = document.querySelector('.mbar');
    if (bar) {
      var lastY = window.scrollY, idle;
      var hero = document.querySelector('.hero-x');
      function topLimit() { return hero ? hero.offsetHeight - 80 : 300; }
      function update() {
        var y = window.scrollY, d = y - lastY;
        var nearEnd = y + window.innerHeight > document.documentElement.scrollHeight - 40;
        if (y < topLimit()) bar.classList.add('is-hidden');
        else if (d > 4 && !nearEnd) bar.classList.add('is-hidden');
        else if (d < -4 || nearEnd) bar.classList.remove('is-hidden');
        lastY = y;
        clearTimeout(idle); idle = setTimeout(function () { if (window.scrollY >= topLimit()) bar.classList.remove('is-hidden'); }, 700);
      }
      if (hero) bar.classList.add('is-hidden');
      window.addEventListener('scroll', update, { passive: true });
    }
    // Menu mobile : se ferme après un clic sur un lien
    document.querySelectorAll('.menu-panel a').forEach(function (a) {
      a.addEventListener('click', function () { var d = a.closest('details'); if (d) d.removeAttribute('open'); });
    });

    var qs = new URLSearchParams(location.search);
    // Suivi des conversions (Google Tag Manager)
    window.dataLayer = window.dataLayer || [];
    function track(ev, extra) { var o = { event: ev }; for (var k in extra || {}) o[k] = extra[k]; window.dataLayer.push(o); }
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="tel:"]'); if (a) track('click_tel', { emplacement: a.className || 'lien' });
      var c = e.target.closest('#sim-cta'); if (c) track('sim_devis');
    });
    document.querySelectorAll('form[data-track="quickstart"]').forEach(function (f) {
      f.addEventListener('submit', function () { track('quickstart', { service: f.service.value }); });
    });

    // Envoi d'un formulaire à envoi.php ; réponse JSON { ok, error }
    var SEND_FAIL = "L'envoi n'a pas abouti. Réessayez ou appelez-nous au 07 56 88 10 72.";
    function send(f) {
      return fetch(f.getAttribute('action') || 'envoi.php', { method: 'POST', body: new FormData(f), headers: { 'X-Requested-With': 'fetch' } })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .catch(function () { return { ok: false }; });
    }
    function busy(btn, on) {
      if (!btn) return;
      if (on) { btn.dataset.label = btn.textContent; btn.textContent = 'Envoi en cours…'; btn.disabled = true; }
      else { btn.textContent = btn.dataset.label || btn.textContent; btn.disabled = false; }
    }

    // Rappel rapide
    document.querySelectorAll('form.callback-form').forEach(function (f) {
      var errEl = document.createElement('p');
      errEl.className = 'callback-error'; errEl.setAttribute('role', 'alert'); errEl.hidden = true;
      errEl.style.cssText = 'margin:.5rem 0 0;font-weight:600;color:#b42318';
      f.querySelector('.callback-done').before(errEl);
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (!f.reportValidity()) return;
        var btn = f.querySelector('button[type=submit]');
        errEl.hidden = true; busy(btn, true);
        send(f).then(function (res) {
          busy(btn, false);
          if (!res.ok) { errEl.textContent = res.error || SEND_FAIL; errEl.hidden = false; return; }
          track('lead_rappel');
          f.querySelectorAll('.field, button').forEach(function (el) { el.hidden = true; });
          f.querySelector('.callback-done').hidden = false;
        });
      });
    });

    // Devis en étapes
    var form = document.getElementById('quote-form');
    if (!form) return;
    var panes = Array.prototype.slice.call(form.querySelectorAll('.step-pane'));
    var dots = form.querySelectorAll('.progress li');
    var prev = document.getElementById('step-prev'), next = document.getElementById('step-next'), submit = document.getElementById('step-submit');
    var err = document.getElementById('step-error');
    var cur = 0;
    form.classList.add('js');

    // Pré-remplissage depuis le simulateur ou une page service
    var svc = qs.get('service');
    if (svc) { var r = form.querySelector('input[name="service"][value="' + svc + '"]'); if (r) { r.checked = true; cur = 1; } }
    var vi = qs.get('ville');
    if (vi) { var v = document.getElementById('f-ville'); if (v) v.value = vi.slice(0, 80); }
    var sf = qs.get('surface');
    if (sf) { var s = document.getElementById('f-surface'); if (s) s.value = parseInt(sf, 10) || ''; }

    function paneValid(p) {
      var ok = true, names = {};
      p.querySelectorAll('input, textarea, select').forEach(function (el) {
        if (el.closest('[hidden]')) return;
        if (el.type === 'radio') {
          if (names[el.name] !== undefined) return;
          var group = p.querySelectorAll('input[name="' + el.name + '"]');
          var needed = Array.prototype.some.call(group, function (g) { return g.required; });
          var picked = Array.prototype.some.call(group, function (g) { return g.checked; });
          names[el.name] = true;
          if (needed && !picked) ok = false;
        } else if (!el.checkValidity()) ok = false;
      });
      return ok;
    }
    function show(i) {
      cur = i;
      panes.forEach(function (p, k) { p.hidden = k !== i; });
      dots.forEach(function (d, k) { d.className = k < i ? 'done' : (k === i ? 'on' : ''); });
      prev.hidden = i === 0;
      next.hidden = i === panes.length - 1;
      submit.hidden = i !== panes.length - 1;
      err.hidden = true;
    }
    function fail(msg) { err.textContent = msg; err.hidden = false; }
    next.addEventListener('click', function () {
      if (!paneValid(panes[cur])) { fail(cur === 0 ? 'Choisissez une prestation pour continuer.' : 'Complétez les champs de cette étape pour continuer.'); return; }
      show(cur + 1);
      var first = panes[cur].querySelector('input:not([type=hidden]), textarea');
      if (first && first.type !== 'radio') first.focus();
    });
    prev.addEventListener('click', function () { show(cur - 1); });

    // Choisir une carte fait avancer
    form.querySelectorAll('input[name="service"]').forEach(function (r) {
      r.addEventListener('change', function () { if (cur === 0) setTimeout(function () { show(1); }, 150); });
    });
    // Date fixe
    form.querySelectorAll('input[name="delai"]').forEach(function (r) {
      r.addEventListener('change', function () { document.getElementById('f-date-wrap').hidden = r.value !== 'Date fixe' || !r.checked; });
    });
    // Particulier : pas de champ société
    form.querySelectorAll('input[name="type_client"]').forEach(function (r) {
      r.addEventListener('change', function () { document.getElementById('f-societe-wrap').hidden = r.value === 'Particulier'; });
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      for (var i = 0; i < panes.length; i++) {
        if (!paneValid(panes[i])) { show(i); fail('Il manque une information à cette étape.'); return; }
      }
      var photo = document.getElementById('f-photo');
      if (photo && photo.files[0] && photo.files[0].size > 8 * 1024 * 1024) { fail('La photo dépasse 8 Mo : choisissez une image plus légère, ou retirez-la.'); return; }
      err.hidden = true; busy(submit, true); prev.disabled = true;
      send(form).then(function (res) {
        busy(submit, false); prev.disabled = false;
        if (!res.ok) { fail(res.error || SEND_FAIL); return; }
        track('lead_devis', { service: (form.querySelector('input[name=service]:checked') || {}).value, type_client: (form.querySelector('input[name=type_client]:checked') || {}).value });
        form.hidden = true;
        document.getElementById('quote-done').hidden = false;
        setTimeout(function () { location.href = 'merci.html'; }, 400);
      });
    });
    show(cur);
  });
})();
