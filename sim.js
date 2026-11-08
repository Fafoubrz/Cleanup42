(function () {
  var root = document.getElementById('sim');
  if (!root) return;
  var P = JSON.parse(root.getAttribute('data-pricing'));
  var $ = function (id) { return document.getElementById(id); };
  var FREQ = { once: 0, month: 1, week: 4.33, daily: 21.7 };
  function r10(x) { return Math.round(x / 10) * 10; }
  function fmt(x) { return x.toLocaleString('fr-FR') + ' €'; }
  function val(name) { var el = root.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : null; }
  function update() {
    var kind = val('sim-kind');
    var surface = Math.max(20, parseInt($('sim-surface').value, 10) || 0);
    $('sim-surface-out').textContent = surface.toLocaleString('fr-FR') + ' m²';
    root.querySelectorAll('[data-for]').forEach(function (el) { el.hidden = el.getAttribute('data-for').split(' ').indexOf(kind) < 0; });
    $('sim-surface-label').textContent = kind === 'vitres' ? '2. Surface de vitres' : '2. Surface des locaux';
    var price = null, lo, hi, unit = '', note = '';
    var f = val('sim-freq'), n = FREQ[f];
    if (kind === 'bureaux') {
      var b = P.bureaux, rate = val('sim-slot') === 'off' ? b.rate_off : b.rate_day;
      var hours = Math.max(b.min_hours, surface / b.m2_per_hour), per = hours * rate;
      var single = Math.max(b.min_single, per * 1.2);
      price = (f === 'once' || f === 'month') ? single : per * n; unit = f === 'once' ? '/ intervention' : '/ mois';
      note = 'Base : environ ' + (Math.round(hours * 4) / 4).toString().replace('.', ',') + ' h par passage.';
    } else if (kind === 'vitres') {
      var v = P.vitres, one = Math.max(v.minimum, surface * v.per_m2);
      if (f === 'daily') f = 'week';
      price = (f === 'once' || f === 'month') ? one : one * 4.33 * 0.85;
      unit = f === 'once' ? '/ intervention' : '/ mois';
      note = 'Vitres accessibles depuis le sol ou l’intérieur. Tarif dégressif en passage régulier.';
    } else if (kind === 'chantier') {
      var c = P.chantier; price = Math.max(c.minimum, surface * c[val('sim-state')]); unit = '';
      note = 'Prix définitif après visite : l’état du chantier compte plus que la surface.';
    } else {
      var l = val('sim-lots');
      $('sim-price').textContent = 'Sur visite';
      $('sim-unit').textContent = '';
      $('sim-range').textContent = l === 'l' ? 'Cahier des charges établi sur place' : (l === 'm' ? 'Contrats à partir de 450 € HT / mois' : 'Contrats à partir de 250 € HT / mois');
      $('sim-note').textContent = 'Le prix dépend du nombre de passages, des étages et de la sortie des containers. Visite gratuite et devis sous 24 h.';
      setCta('nettoyage-immeuble-saint-etienne', surface);
      return;
    }
    lo = r10(price * 0.95); hi = r10(price * 1.15);
    tween(r10(price));
    $('sim-unit').textContent = unit;
    $('sim-range').textContent = 'Fourchette : ' + fmt(lo) + ' – ' + fmt(hi);
    $('sim-note').textContent = note + ' Tarif indicatif, devis définitif après visite.';
    setCta({ bureaux: 'nettoyage-bureaux-saint-etienne', vitres: 'nettoyage-vitres-saint-etienne', chantier: 'nettoyage-fin-de-chantier-saint-etienne' }[kind], surface);
  }
  var shown = null, raf;
  function tween(target) {
    var el = $('sim-price');
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (shown === null || reduce) { shown = target; el.textContent = fmt(target); return; }
    var from = shown, t0 = performance.now(), dur = 450;
    cancelAnimationFrame(raf);
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      shown = Math.round(from + (target - from) * e);
      el.textContent = fmt(k < 1 ? shown : target);
      if (k < 1) raf = requestAnimationFrame(step); else shown = target;
    })(t0);
  }
  function setCta(slug, surface) { $('sim-cta').setAttribute('href', '/demande-de-devis?service=' + slug + '&surface=' + surface); }
  root.addEventListener('input', update);
  root.addEventListener('change', update);
  var pre = root.getAttribute('data-kind');
  if (pre) { var r = root.querySelector('input[name="sim-kind"][value="' + pre + '"]'); if (r) r.checked = true; }
  update();
})();
