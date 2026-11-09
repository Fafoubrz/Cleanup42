# Components — primitives (HTML + classes de style.css)

Pas de framework : les composants sont des motifs HTML stylés par `style.css`.

## Boutons (`style.css`, section « Buttons »)
```css
/* Buttons */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 26px; border-radius: 999px; font-weight: 700; font-size: 1rem; text-decoration: none; border: 1.5px solid transparent; cursor: pointer; font-family: var(--f-body); line-height: 1.2; transition: background .15s, color .15s, border-color .15s; }
.btn-primary { background: var(--blue); color: var(--on-blue); }
.btn-primary:hover { background: var(--blue-deep); color: var(--on-blue); }
.btn-ghost { background: transparent; color: var(--ink); border-color: var(--line-strong); }
.btn-ghost:hover { border-color: var(--ink); }
.btn-light { background: #fff; color: #0a1a33; }
.btn-light:hover { background: #eaf0ff; color: #0a1a33; }
.btn-outline-light { color: #fff; border-color: rgba(255, 255, 255, .6); }
.btn-outline-light:hover { border-color: #fff; background: rgba(255, 255, 255, .1); color: #fff; }
.btn-row { display: flex; flex-wrap: wrap; gap: 12px; }
.btn-block { width: 100%; }


```
Exemples : `<a class="btn btn-primary" href="/demande-de-devis">Devis gratuit</a>` · `<a class="btn btn-ghost" href="tel:+33756881072">07 56 88 10 72</a>`

## Formulaires (`style.css`, section « Forms »)
```css
/* Forms */
.form-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, .8fr); gap: clamp(28px, 5vw, 56px); align-items: start; }
form.quote { background: var(--bg); border: 1px solid var(--line); border-radius: 20px; padding: clamp(22px, 3vw, 34px); display: grid; gap: 20px; }
.field { display: grid; gap: 6px; min-width: 0; }
.field label, .field legend { font-weight: 700; font-size: .95rem; }
.field .hint { font-size: .85rem; color: var(--muted); font-weight: 400; }
.row-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
input[type="text"], input[type="tel"], input[type="email"], input[type="date"], select, textarea { width: 100%; font: inherit; font-size: 1rem; color: var(--ink); background: var(--bg); border: 1px solid var(--line-strong); border-radius: 10px; padding: 12px 14px; }
input:focus, select:focus, textarea:focus { border-color: var(--blue); outline: none; box-shadow: 0 0 0 3px var(--blue-soft); }
textarea { min-height: 120px; resize: vertical; }
fieldset { border: 0; margin: 0; padding: 0; min-width: 0; }
.consent { display: grid; grid-template-columns: 20px minmax(0, 1fr); gap: 10px; font-size: .9rem; color: var(--muted); }
.consent input { accent-color: var(--blue); margin-top: 4px; }
.hp { position: absolute; left: -9999px; }
.done { background: var(--blue-soft); border: 1px solid var(--blue); border-radius: 18px; padding: 24px; display: grid; gap: 8px; }
.progress { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; counter-reset: st; }
.progress li { counter-increment: st; font-size: .82rem; font-weight: 700; color: var(--muted); padding-top: 10px; border-top: 4px solid var(--line-strong); }
.progress li::before { content: counter(st) ". "; }
.progress li.on { color: var(--blue); border-color: var(--blue); }
.progress li.done { color: var(--ink); border-color: var(--blue); }
.steps-form:not(.js) .progress { display: none; }
.step-pane { display: grid; gap: 18px; }
.step-title { font-family: var(--f-display); font-weight: 800; font-size: 1.45rem; letter-spacing: -0.03em; margin-bottom: 4px; padding: 0; }
.picks { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 10px; }
.pick { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; padding: 16px; border: 1px solid var(--line-strong); border-radius: 14px; cursor: pointer; font-weight: 700; font-size: .95rem; line-height: 1.3; }
.pick svg { color: var(--blue); }
.step-nav { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; }
.step-nav .btn-primary { margin-left: auto; }
.step-error { color: #b42318; font-weight: 700; font-size: .95rem; }


```

## Cartes de services (`style.css`, section « Service groups »)
```css
/* Service groups */
.groups-sec { padding-top: clamp(24px, 4vw, 48px); }
.groups { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.group { display: flex; flex-direction: column; min-width: 0; }
.group-photo { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; border-radius: 18px; }
.group-body { padding: 22px 2px 0; display: grid; gap: 10px; }
.group-body h3 { font-size: 1.5rem; }
.group-body > p { color: var(--text); }
.group ul { list-style: none; margin: 10px 0 0; padding: 0; border-top: 1px solid var(--line-strong); }
.group li a { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 13px 0; border-bottom: 1px solid var(--line); text-decoration: none; color: var(--ink); font-weight: 600; }
.group li a em { font-style: normal; font-weight: 500; font-size: .88rem; color: var(--muted); text-align: right; }
.group li a:hover span { color: var(--blue); }
.group li a span::after { content: " →"; color: var(--blue); opacity: 0; transition: opacity .15s; }
.group li a:hover span::after { opacity: 1; }


```
