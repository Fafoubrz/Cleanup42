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

    // Devis : formulaire court
    var form = document.getElementById('quote-form');
    if (!form) return;
    var submit = document.getElementById('step-submit');
    var err = document.getElementById('step-error');
    var sel = document.getElementById('f-service');

    // Pré-remplissage depuis l'accueil ou une page service
    var svc = qs.get('service');
    if (svc && sel && sel.querySelector('option[value="' + svc.replace(/[^a-z0-9-]/g, '') + '"]')) sel.value = svc;
    var vi = qs.get('ville');
    if (vi) { var v = document.getElementById('f-ville'); if (v) v.value = vi.slice(0, 80); }

    function fail(msg) { err.textContent = msg; err.hidden = false; }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var bad = form.querySelector(':invalid');
      if (bad) { fail('Il manque une information : vérifiez les champs signalés.'); bad.focus(); form.reportValidity && form.reportValidity(); return; }
      var photo = document.getElementById('f-photo');
      if (photo && photo.files[0] && photo.files[0].size > 8 * 1024 * 1024) { fail('La photo dépasse 8 Mo : choisissez une image plus légère, ou retirez-la.'); return; }
      err.hidden = true; busy(submit, true);
      send(form).then(function (res) {
        busy(submit, false);
        if (!res.ok) { fail(res.error || SEND_FAIL); return; }
        track('lead_devis', { service: sel ? sel.value : '' });
        form.hidden = true;
        var done = document.getElementById('quote-done');
        if (done) done.hidden = false;
        setTimeout(function () { location.href = '/merci'; }, 400);
      });
    });
  });
})();
