# Extractable components

#### Layout Components
## SiteHeader
- Source: `index.html` (`<header class="site-head">`)
- Category: layout
- Description: En-tête fixe avec logo CleanUp42, mega-menu Services (3 familles pro + CTA), liens, téléphone et bouton Devis gratuit
- Extractable props: activeItem (string, default: "")
- Hardcoded: logo, libellés, liens, icônes SVG, styles

## SiteFooter
- Source: `index.html` (`<footer class="site-foot">`)
- Category: layout
- Description: Pied de page bleu avec logo blanc, coordonnées et 3 colonnes de liens
- Extractable props: aucun
- Hardcoded: tout

#### Basic Components
- Boutons `.btn-primary` (bleu plein, pilule), `.btn-ghost`, `.btn-outline-light`, `.btn-white` — inline HTML
- Carte de service `.group`, carte FAQ `details`, chips `.chip` — inline HTML
