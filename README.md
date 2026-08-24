# Momos group Rooster & Personeels systeem

Rooster systeem voor Restaurant Momo's waarmee diensten, verlof, medewerkers en functies worden beheerd. Gebouwd met Nuxt 3 (Vue) en Firebase.

## Inhoud

- [Technische keuzes](#technische-keuzes)
- [Design keuzes](#design-keuzes)
- [Projectstructuur](#projectstructuur)
- [Setup](#setup)

## Technische keuzes

### Nuxt 3 (Vue 3, Composition API)

Het project is gebouwd met Nuxt 3 in plaats van een kant en klaar platform (zoals WordPress), zodat er volledige controle is over functionaliteit, performance en data. Alle pagina's gebruiken `<script setup>` met de Composition API en imports (`ref`, `computed`, `reactive`, `watch`, `onMounted`).

### Firebase (Auth + Firestore)

- **Authenticatie** via `firebase/auth` met e-mail/wachtwoord. Er is één vaste admin (`ADMIN_EMAIL` in [`app/utils/constants.js`](app/utils/constants.js)); iedere andere ingelogde gebruiker wordt als medewerker gezet.
- **Data** wordt opgeslagen in Firestore, met live updates via `onSnapshot` zodat wijzigingen (bijvoorbeeld een nieuwe dienst) direct zichtbaar zijn zonder te herladen.
- Firestore security rules beperken schrijftoegang voor allen de admin.
- Firebase wordt eenmalig geïnitialiseerd in een client side plugin ([`app/plugins/firebase.client.js`](app/plugins/firebase.client.js)) en via composables (`useFirebaseAuth`, `useFirestore`) beschikbaar gemaakt in de rest van de app.

### Twee gescheiden layouts en toegangsniveaus

De app kent twee layouts met elk hun eigen navigatie en auth guard:

- **`admin`** ([`app/layouts/admin.vue`](app/layouts/admin.vue)): sidebar met Diensten, Evenementen, Verlof, Medewerkers en Functies. Alleen toegankelijk voor de admin.
- **`medewerker`** ([`app/layouts/medewerker.vue`](app/layouts/medewerker.vue)): sidebar met Diensten en Verlof. Toont alleen de eigen gegevens van de ingelogde medewerker.

Een medewerker die naar een admin route navigeert (en andersom) wordt automatisch teruggestuurd naar zijn eigen omgeving.

### Koppeling medewerker rooster

 Het e-mailadres van de ingelogde gebruiker  wordt opgezocht in de `medewerkers` collectie, waarna op naam wordt gefilterd in de `diensten` collectie. Dit houdt het aanmaken van medewerkers (door de admin) en het uitnodigen van accounts (via Firebase) los van elkaar.

## Design keuzes

### Kleursysteem en design tokens

Alle kleuren, spacing, radius en transitions zijn vastgelegd als CSS custom properties in [`app/assets/styles/stylesheet.css`](app/assets/styles/stylesheet.css), zodat de hele app consistent oogt en eenvoudig aan te passen is vanuit één bestand:

```css
--c-primary   
--c-navy      
--c-light     
--c-success-h/-s, --c-warning-h/-s, --c-error-h/-s  /
--space-xs/s/m/l/xl                                   
--radius, --transition
```

### Donker thema met zwevende kaarten

De beheeromgeving gebruikt een donker thema: content in navy kleurige kaarten (`--c-navy`) die zweven op een nog donkerdere achtergrond (`--c-primary`). Status- en functie-badges gebruiken dezelfde HSL-tokens met een aangepaste lightness/alpha, zodat nieuwe statussen of rollen een consistente kleur krijgen.

### Responsive vanaf één breakpoint

Er wordt gewerkt met één breakpoint: `@media (max-width: 40rem)`. Op admin en medewerkerpagina's klapt de verticale sidebar om naar een horizontale, *icon only* balk, roosters en formulieren schakelen van een column layoutnaar een gestapelde lijst.

### Semantische HTML

Waar mogelijk worden goede elementen gebruikt in plaats van `<div>`'s: `<article>`, `<section>`, `<form>`, `<fieldset>`/`<legend>`, `<nav>`, `<main>`. 

## Projectstructuur

```
app/
├── layouts/
│   ├── admin.vue          
│   └── medewerker.vue     
├── pages/
│   ├── index.vue          
│   ├── roosters.vue     
│   ├── verlof.vue         
│   └── admin/
│       ├── diensten.vue  
│       ├── medewerkers.vue
│       ├── functies.vue
│       ├── evenementen.vue
│       └── verlof.vue
├── composables/
│   ├── useFirebaseAuth.js
│   └── useFirestore.js
├── plugins/
│   └── firebase.client.js 
├── utils/
│   └── constants.js       
└── assets/styles/
    └── stylesheet.css     
```

## Setup

Installeer dependencies:

```bash
npm install
```

Maak een `.env` aan op basis van `.env.example` met de Firebase projectgegevens.

Start de development server op `http://localhost:3000`:

```bash
npm run dev
```

Build voor productie:

```bash
npm run build
```
