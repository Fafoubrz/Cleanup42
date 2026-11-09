# Theme — CleanUp42

## Part 1 — Résumé des jetons (valeurs effectives)
- Couleurs (`:root` l. 2, surchargées l. 473) : fond `--bg` #f1f4f9 · papier `--paper` #e6ecf5 · encre `--ink` #13233f · texte #39475e · muted #5d6b82 · lignes #d9e1ed / #c4cfdf · bleu marque `--blue` #1b4fd6 · bleu foncé #143da8 · bleu doux #e1e9fb · ciel `--sky` #8fb4ff · nuit #081428 · vert ok #157347. Hero sur photo avec voile bleu (#2457d6 pour certains fonds pleins), pied de page bleu #2457d6.
- Polices : titres « Schibsted Grotesk » 600–800 (Google Fonts), texte « Hanken Grotesk » 400–700. Titres très gras, interlettrage serré ; corps 17px, line-height 1.6.
- Rayons : 14px par défaut (`--radius`), cartes 18–22px, boutons en pilule (999px).
- Ombres : douces et bleutées sur les cartes flottantes (formulaire hero, simulateur).
- Mise en page : conteneur `.wrap` ~1200px, sections aérées, grands visuels photo. Points de rupture : 1100, 980, 860, 620, 400px.
- Mouvement : apparition au défilement, raclette qui « nettoie » la photo du hero, bulles de savon, titres ligne par ligne, boutons magnétiques (désactivés si prefers-reduced-motion).

## Part 2 — Source
`style.css` complet (814 lignes) est passé tel quel comme contexte.
```css
/* Layout: éditorial et aéré. Grandes photos, typographie forte, peu de cadres ; le bleu sert aux actions, le reste est blanc, gris bleuté et encre. */
:root {
  --bg: #ffffff;
  --paper: #f5f7fb;
  --ink: #0a1a33;
  --text: #39475e;
  --muted: #5d6b82;
  --line: #e3e8f1;
  --line-strong: #cfd8e6;
  --blue: #1b4fd6;
  --blue-deep: #143da8;
  --blue-soft: #eaf0ff;
  --on-blue: #ffffff;
  --night: #081428;
  --on-night: #c3cee0;
  --sky: #8fb4ff;
  --ok: #157347;
  --f-display: "Schibsted Grotesk", "Helvetica Neue", Arial, sans-serif;
  --f-body: "Hanken Grotesk", "Segoe UI", system-ui, -apple-system, sans-serif;
  --radius: 14px;
  color-scheme: light;
}




```
