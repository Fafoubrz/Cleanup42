# Routes — site statique (Hostinger, .htaccess)

Adresses propres : `/page` sert `page.html` ; `/page.html` → 301 `/page`. 41 pages indexées (sitemap.xml).

| URL | Fichier | Rôle |
|---|---|---|
| `/` | `index.html` | Accueil : hero photo + formulaire rapide, bandeau confiance, 3 familles de services, méthode, simulateur de prix, note Google, interlocuteur, zones, FAQ, CTA rappel |
| `/nettoyage-bureaux-saint-etienne` | `nettoyage-bureaux-saint-etienne.html` | Page service principale (hero + fiche tarif, pour qui / inclus, méthode, fréquences, simulateur, FAQ, conseils) |
| `/nettoyage-vitres-saint-etienne`, `/nettoyage-immeuble-saint-etienne`, `/nettoyage-fin-de-chantier-saint-etienne`, `/nettoyage-sieges-bureau-saint-etienne`, `/nettoyage-exterieur-saint-etienne`, `/nettoyage-diogene-saint-etienne` | `*.html` | Pages services (même gabarit) |
| `/nettoyage-<ville>`, `/nettoyage-bureaux-<ville>`, … | `*.html` | Pages locales (même gabarit) |
| `/demande-de-devis` | `demande-de-devis.html` | Formulaire de devis en 4 étapes (`forms.js`) |
| `/zones-intervention`, `/conseils`, `/qui-sommes-nous`, `/mentions-legales`, `/merci`, `/404` | `*.html` | Pages annexes |
