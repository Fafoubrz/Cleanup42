# Pages — arbres de dépendances

## / (Accueil)
Entry: `index.html` (balisage complet ; données JSON-LD en tête, sans rendu)
Dependencies:
- `style.css` (tous les styles, 814 lignes, jetons dans `:root` l. 2 et l. 473)
- `forms.js` (apparition au défilement, menu mobile, formulaires, barre d'appel)
- `fx.js` (effets : bulles, raclette, parallaxe, compteurs)
- `sim.js` (simulateur de prix)
- images : `img/hero.*`, `img/openspace.*`, `img/hall.*`, `img/chantier.*`, `img/vitrine.*`, `img/equipe.*`
- `favicon.svg`

Version nettoyée pour Superdesign (sans JSON-LD, logo remplacé par le Brand Asset) : `.superdesign/tmp/home-render.html`.

## /nettoyage-bureaux-saint-etienne
Entry: `nettoyage-bureaux-saint-etienne.html` · mêmes dépendances (`style.css`, `forms.js`, `fx.js`, `sim.js`).
