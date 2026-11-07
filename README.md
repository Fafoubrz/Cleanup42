# CleanUp42

Site vitrine de CleanUp42, entreprise de nettoyage professionnel à Saint-Étienne (Loire).

Site statique (HTML/CSS/JS, sans build) : ouvrir `index.html` ou servir le dossier avec n'importe quel serveur web, par exemple :

```sh
python3 -m http.server 8000
```

- `index.html` : accueil (avec simulateur de prix `sim.js`)
- `nettoyage-*.html` : pages services et pages villes
- `demande-de-devis.html` : formulaire de devis en étapes (`forms.js`)
- `envoi.php` : envoie les formulaires « devis » et « rappel » par e-mail à l'adresse `DESTINATAIRE` (en haut du fichier) et en garde une copie dans `../demandes-cleanup42/demandes.csv`, hors du dossier public. Nécessite PHP (hébergement Hostinger).
- `style.css`, `fx.js` : styles et animations
- `img/` : photos (JPG + WebP)
