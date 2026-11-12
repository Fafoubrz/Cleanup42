/*
 * Mesure d'audience et conversions (Google Analytics 4 + Google Ads)
 * - Rien n'est chargé ni déposé tant que le visiteur n'a pas cliqué « Tout accepter » (consentement CNIL).
 * - Le choix est gardé 6 mois, puis redemandé. Lien « Gestion des cookies » en pied de page pour le changer.
 * - Sans identifiant renseigné ci-dessous, ce fichier ne fait rien (pas de bandeau).
 */
(function () {
  var CFG = {
    ga4: 'G-2PK1C37XCM',            // ex. 'G-XXXXXXXXXX'  (Google Analytics 4)
    ads: 'AW-18393775555',            // ex. 'AW-123456789'  (Google Ads)
    conv: {             // libellés de conversion Google Ads (partie après la barre oblique)
      lead_devis: '7a1lCIHCorcdEMP76sJE',
      lead_rappel: 'ypFMCITCorcdEMP76sJE',
      click_tel: '4HFoCIfCorcdEMP76sJE'
    }
  };

  window.cuTrack = function () {};
  if (!CFG.ga4 && !CFG.ads) return;

  var KEY = 'cu_consent', MAX = 182 * 864e5, loaded = false;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });

  function read() {
    try { var v = JSON.parse(localStorage.getItem(KEY)); if (v && Date.now() - v.t < MAX) return v.c; } catch (e) {}
    return null;
  }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify({ c: c, t: Date.now() })); } catch (e) {} }

  function load() {
    if (loaded) return; loaded = true;
    gtag('consent', 'update', { ad_storage: 'granted', analytics_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + (CFG.ga4 || CFG.ads);
    document.head.appendChild(s);
    gtag('js', new Date());
    if (CFG.ga4) gtag('config', CFG.ga4);
    if (CFG.ads) gtag('config', CFG.ads);
  }

  var NAMES = { lead_devis: 'generate_lead', lead_rappel: 'generate_lead' };
  window.cuTrack = function (ev, p) {
    if (!loaded) return;
    var params = {}; for (var k in p || {}) if (k !== 'event') params[k] = p[k];
    if (ev === 'lead_devis') params.form_type = 'devis';
    if (ev === 'lead_rappel') params.form_type = 'rappel';
    params.transport_type = 'beacon';
    gtag('event', NAMES[ev] || ev, params);
    var label = CFG.conv[ev];
    if (CFG.ads && label) gtag('event', 'conversion', { send_to: CFG.ads + '/' + label, transport_type: 'beacon' });
  };

  // ---- Bandeau de consentement ----
  var box;
  function close() { if (box) { box.remove(); box = null; } }
  function choose(ok) { save(ok ? 'yes' : 'no'); close(); if (ok) load(); else if (loaded) location.reload(); }
  function show() {
    if (box) return;
    box = document.createElement('div');
    box.className = 'cc';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Choix des cookies');
    box.innerHTML = '<p><b>Cookies</b> Avec votre accord, nous utilisons Google Analytics et Google Ads pour mesurer la fréquentation du site et l’efficacité de nos annonces. Rien n’est déposé sans votre accord. <a href="/mentions-legales#cookies">En savoir plus</a></p>' +
      '<div class="cc-btns"><button type="button" class="btn cc-btn" data-cc="no">Tout refuser</button><button type="button" class="btn cc-btn" data-cc="yes">Tout accepter</button></div>';
    box.addEventListener('click', function (e) { var b = e.target.closest('[data-cc]'); if (b) choose(b.getAttribute('data-cc') === 'yes'); });
    document.body.appendChild(box);
  }

  function init() {
    document.querySelectorAll('[data-cookies]').forEach(function (a) {
      a.hidden = false;
      var li = a.closest('li'); if (li) li.hidden = false;
      a.addEventListener('click', function (e) { e.preventDefault(); show(); });
    });
    var c = read();
    if (c === 'yes') load(); else if (c === null) show();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
