# CCA (Colour Contrast Analyser) & WCAG-rapport — Momos Group

Uitgevoerd op de lokale ontwikkelversie (`localhost:3000`), gebaseerd op de daadwerkelijke kleurwaarden uit `app/assets/styles/stylesheet.css` en de scoped styles per pagina. Getoetst tegen WCAG 2.1 niveau AA.

## 1. Colour Contrast Analyser — resultaten

| Combinatie | Ratio | Norm | Resultaat |
|---|---|---|---|
| Body tekst op paginabg | 15.42:1 | 4.5:1 | ✅ |
| Sidebar inactieve link | 9.18:1 | 4.5:1 | ✅ |
| Sidebar actieve link (wit op navy) | 10.92:1 | 4.5:1 | ✅ |
| Kaarttitel (wit op navy card) | 10.92:1 | 4.5:1 | ✅ |
| Kaart subtekst 65% grijs op navy | **4.47:1** | 4.5:1 | ❌ (net onder de norm) |
| Kaart subtekst 70–75% grijs op navy | 5.18–5.95:1 | 4.5:1 | ✅ |
| Input tekst wit op navy | 10.92:1 | 4.5:1 | ✅ |
| **Input placeholder 50% grijs op navy** | **2.74:1** | 4.5:1 | ❌ |
| **Input placeholder 55% grijs op navy** | **3.26:1** | 4.5:1 | ❌ |
| Statuslabels (goedgekeurd/behandeling/afgewezen) | 5.06–5.74:1 | 4.5:1 | ✅ |
| Verlof-melding succes/fout | 6.04–6.50:1 | 4.5:1 | ✅ |
| Dag-verlof oranje banner | 5.30:1 | 4.5:1 | ✅ |
| Verwijder-icoon (UI-component, geen tekst) | 4.47:1 | 3:1 | ✅ |
| Verstuur-knop wit op blauw | 5.52:1 | 4.5:1 | ✅ |
| Login titel/subtitel op lichte kaart | 5.09–15.42:1 | 4.5:1 | ✅ |
| **Login/wachtwoord-knop wit op groen** | **3.13:1** | 4.5:1 | ❌ |

### Bevindingen om te fixen

1. **`.submit-btn` (login- en wachtwoord-vergeten-knop)** — `background: hsl(166, 40%, 45%)` met witte tekst geeft 3.13:1, ruim onder de vereiste 4.5:1 voor normale tekst. Bron: `app/assets/styles/stylesheet.css:259`.
   - Advies: verlaag de lightness naar circa 38% (bv. `hsl(166, 40%, 38%)`) om boven 4.5:1 uit te komen.

2. **Input-placeholders `hsl(0, 0%, 50%)` en `hsl(0, 0%, 55%)`** — komen voor in `verlof.vue` (regel 282), `admin/diensten.vue` (regel 878) en `admin/medewerkers.vue` (regel 213). Placeholder-tekst valt formeel buiten de strikte WCAG-tekstnorm, maar 2.74:1 is zo laag dat het voor slechtziende gebruikers nauwelijks leesbaar is.
   - Advies: verhoog naar minimaal `hsl(0, 0%, 62%)` op de navy achtergrond.

3. **Subtekst `hsl(0, 0%, 65%)` op navy-kaarten** — komt op meerdere plekken voor (`verlof.vue`, `admin/verlof.vue`, `admin/medewerkers.vue`, `admin/diensten.vue`) en zit met 4.47:1 net onder de norm.
   - Advies: verhoog naar `hsl(0, 0%, 68%)` of hoger.

## 2. Bredere WCAG-observaties (handmatige check op de live app)

| # | Bevinding | WCAG-criterium | Ernst |
|---|---|---|---|
| 1 | Geen skip-link aanwezig. De `.skip-link`-CSS-class staat wel klaar in `stylesheet.css`, maar wordt nergens in een template gebruikt. Toetsenbordgebruikers moeten op elke pagina eerst door de volledige sidebar-navigatie tabben voordat ze bij de hoofdinhoud zijn. | 2.4.1 Bypass Blocks | Gemiddeld |
| 2 | `admin/diensten.vue` (het hoofdrooster) heeft geen eigen `<h1>/<h2>` voor de content zelf — alleen de sidebar-titel "Beheer" (h1) is aanwezig. Screenreader-gebruikers die op koppen navigeren vinden geen oriëntatiepunt voor "Diensten". | 2.4.6 Headings and Labels | Laag/gemiddeld |
| 3 | De "+"-knop om een dienst toe te voegen (`admin/diensten.vue`, regel 387) heeft als enige toegankelijke naam het teken "+", zonder `aria-label`. Voor screenreader-gebruikers is niet duidelijk wélke dienst/dag dit toevoegt. | 4.1.2 Name, Role, Value | Gemiddeld |
| 4 | `input:focus { outline: none; border-color: ... }` (login, modals, formulieren) verwijdert de standaard focus-outline en vervangt die door een subtiele randkleur-verandering. Functioneel aanwezig, maar het contrast/oppervlak van die indicator is niet getest tegen WCAG 2.2's Focus Appearance-richtlijn. | 2.4.7 Focus Visible | Laag |
| 5 | Geen `<img>`-elementen in de app (alles is inline SVG, correct gemarkeerd met `aria-hidden="true"` naast zichtbare tekst) — geen alt-tekst-problemen gevonden. | 1.1.1 Non-text Content | ✅ Geen probleem |
| 6 | Statusinformatie (goedgekeurd/afgewezen/in behandeling, functie-badges) wordt altijd met kleur **én** tekstlabel getoond, nooit kleur alleen. | 1.4.1 Use of Color | ✅ Geen probleem |
| 7 | Formuliervelden gebruiken consequent `<label>` met genest `<input>`/`<textarea>`, dus impliciete label-koppeling is overal aanwezig. | 1.3.1 / 3.3.2 | ✅ Geen probleem |

## 3. Samenvatting voor "Observaties en feedback"

**Sterke punten:** consistente labelkoppeling, geen ontbrekende alt-teksten, statusinformatie nooit kleur-only, hoofdtekst en de meeste UI-kleuren ruim boven de AA-norm.

**Belangrijkste verbeterpunten:**
1. Vier kleurcombinaties (loginknop, twee placeholder-tinten, één subtekst-tint) halen de WCAG AA-contrastnorm niet — concreet te fixen door de lightness-waarden in `stylesheet.css` en de betreffende pagina's iets te verhogen/verlagen.
2. Er ontbreekt een skip-link, wat toetsenbordgebruik op elke pagina onnodig omslachtig maakt.
3. Eén icoon-only knop ("+") mist een beschrijvend `aria-label`.
