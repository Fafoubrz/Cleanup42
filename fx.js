/* Effets visuels CleanUp42 — légers, désactivés si l'utilisateur limite les animations */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    document.documentElement.classList.add('fx-ready');

    // Barre de progression de lecture
    var bar = document.createElement('div'); bar.className = 'read-progress'; bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    function prog() {
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
    }
    addEventListener('scroll', prog, { passive: true }); prog();

    if (reduce) return;

    // Bulles de savon
    document.querySelectorAll('.bubbles').forEach(function (box) {
      var n = box.closest('.hero-x') ? 9 : 7;
      for (var i = 0; i < n; i++) {
        var b = document.createElement('span');
        var size = 10 + Math.random() * 38;
        b.style.width = b.style.height = size + 'px';
        b.style.left = (Math.random() * 100) + '%';
        b.style.animationDuration = (9 + Math.random() * 10) + 's';
        b.style.animationDelay = (-Math.random() * 14) + 's';
        b.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
        box.appendChild(b);
      }
    });

    // Compteurs animés (note Google)
    var counters = document.querySelectorAll('.rv-note');
    if ('IntersectionObserver' in window) {
      var co = new IntersectionObserver(function (en) {
        en.forEach(function (x) {
          if (!x.isIntersecting) return; co.unobserve(x.target);
          var node = x.target.firstChild; if (!node || node.nodeType !== 3) return;
          var target = parseFloat(node.textContent.replace(',', '.')); if (isNaN(target)) return;
          var t0 = performance.now();
          (function step(t) {
            var k = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - k, 3);
            node.textContent = (target * e).toFixed(1).replace('.', ',');
            if (k < 1) requestAnimationFrame(step);
          })(t0);
        });
      }, { threshold: .6 });
      counters.forEach(function (c) { co.observe(c); });
    }

    // Parallaxe douce sur les grandes photos
    var par = Array.prototype.slice.call(document.querySelectorAll('.split-img, .hero-bg'));
    function parallax() {
      par.forEach(function (img) {
        var r = img.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        img.style.setProperty('--py', (c * -28).toFixed(1) + 'px');
      });
    }
    addEventListener('scroll', function () { requestAnimationFrame(parallax); }, { passive: true }); parallax();

    // Ligne des étapes qui se dessine au défilement
    document.querySelectorAll('.flow').forEach(function (fl) {
      function draw() {
        var r = fl.getBoundingClientRect();
        var k = Math.max(0, Math.min(1, (innerHeight * .75 - r.top) / r.height));
        fl.style.setProperty('--flow', k.toFixed(3));
      }
      addEventListener('scroll', function () { requestAnimationFrame(draw); }, { passive: true }); draw();
    });

    if (!fine) return;

    // Cartes inclinables (souris uniquement)
    document.querySelectorAll('.real, .rv, .post, .sim-type').forEach(function (el) {
      el.classList.add('tilt');
      el.addEventListener('mousemove', function (ev) {
        var r = el.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5;
        el.style.setProperty('--rx', (-y * 5).toFixed(2) + 'deg');
        el.style.setProperty('--ry', (x * 6).toFixed(2) + 'deg');
        el.style.setProperty('--mx', ((x + .5) * 100).toFixed(1) + '%');
        el.style.setProperty('--my', ((y + .5) * 100).toFixed(1) + '%');
      });
      el.addEventListener('mouseleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });

    // Boutons magnétiques
    document.querySelectorAll('.btn-primary, .btn-white').forEach(function (b) {
      b.addEventListener('mousemove', function (ev) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--bx', ((ev.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px');
        b.style.setProperty('--by', ((ev.clientY - r.top - r.height / 2) * .25).toFixed(1) + 'px');
      });
      b.addEventListener('mouseleave', function () { b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });
  });
})();
