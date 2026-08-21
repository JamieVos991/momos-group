<script setup>
definePageMeta({ layout: "admin" });

useHead({
  title: "Diensten",
});

const functies = [
  { key: "bediening", label: "Bediening" },
  { key: "keuken", label: "Keuken" },
  { key: "spoelkeuken", label: "Spoelkeuken" },
];

const dagLabels = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"];
const maandLabels = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

function geefMaandag(datum) {
  const d = new Date(datum);
  const dagNr = d.getDay();
  const verschil = dagNr === 0 ? -6 : 1 - dagNr;
  d.setDate(d.getDate() + verschil);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDatum(d) {
  return `${d.getDate()} ${maandLabels[d.getMonth()]}`;
}

function isVandaag(d) {
  const vandaag = new Date();
  return (
    d.getDate() === vandaag.getDate() &&
    d.getMonth() === vandaag.getMonth() &&
    d.getFullYear() === vandaag.getFullYear()
  );
}

const weekStart = ref(geefMaandag(new Date()));

const dagen = computed(() =>
  dagLabels.map((label, i) => {
    const datum = new Date(weekStart.value);
    datum.setDate(datum.getDate() + i);
    return {
      key: label.toLowerCase(),
      label,
      datum: formatDatum(datum),
      vandaag: isVandaag(datum),
      diensten: { bediening: [], keuken: [], spoelkeuken: [] },
    };
  })
);

const weekLabel = computed(() => {
  const eind = new Date(weekStart.value);
  eind.setDate(eind.getDate() + 6);
  return `${formatDatum(weekStart.value)} – ${formatDatum(eind)}`;
});

function vorigeWeek() {
  const d = new Date(weekStart.value);
  d.setDate(d.getDate() - 7);
  weekStart.value = d;
}

function volgendeWeek() {
  const d = new Date(weekStart.value);
  d.setDate(d.getDate() + 7);
  weekStart.value = d;
}

const datumInputRef = ref(null);

function openAgenda() {
  if (datumInputRef.value?.showPicker) datumInputRef.value.showPicker();
  else datumInputRef.value?.click();
}

function kiesDatum(event) {
  if (!event.target.value) return;
  weekStart.value = geefMaandag(new Date(event.target.value));
}
</script>

<template>
  <div class="diensten-card">
    <header class="diensten-card__header">
      <h2 class="diensten-card__title">Geplande diensten</h2>

      <div class="week-nav">
        <button
          type="button"
          class="week-nav__btn"
          aria-label="Vorige week"
          @click="vorigeWeek"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <span class="week-nav__label">{{ weekLabel }}</span>
        <button
          type="button"
          class="week-nav__btn"
          aria-label="Kies week in agenda"
          @click="openAgenda"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect
              x="3.5"
              y="4.5"
              width="17"
              height="16"
              rx="2"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <path d="M3.5 9.5h17" stroke="currentColor" stroke-width="1.8" />
            <path
              d="M8 2.5v4M16 2.5v4"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          <input
            ref="datumInputRef"
            type="date"
            class="week-nav__datum-input"
            aria-hidden="true"
            tabindex="-1"
            @change="kiesDatum"
          />
        </button>
        <button
          type="button"
          class="week-nav__btn"
          aria-label="Volgende week"
          @click="volgendeWeek"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>

    <div class="diensten-grid">
      <div v-for="dag in dagen" :key="dag.key" class="dag-kolom">
        <div class="dag-header" :class="{ 'dag-header--vandaag': dag.vandaag }">
          <p class="dag-header__label">{{ dag.label }}</p>
          <p class="dag-header__datum">{{ dag.datum }}</p>
        </div>

        <div
          v-for="functie in functies"
          :key="functie.key"
          class="sectie"
          :class="`sectie--${functie.key}`"
        >
          <p class="sectie__header">
            <span class="sectie__dot" />
            {{ functie.label.toUpperCase() }}
          </p>

          <button type="button" class="dienst-toevoegen">+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.diensten-card {
  background: var(--c-navy);
  color: var(--c-light);
  border-radius: var(--radius);
  box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.diensten-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: var(--space-m);
}

.diensten-card__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.week-nav {
  display: flex;
  align-items: center;
  gap: var(--space-m);
}

.week-nav__label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}

.week-nav__btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  color: #fff;
  background: hsla(0, 0%, 100%, 0.08);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background var(--transition);

  svg {
    width: 0.9rem;
    height: 0.9rem;
  }
}

.week-nav__datum-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  border: none;
}

.week-nav__btn:hover {
  background: hsla(0, 0%, 100%, 0.15);
}

.diensten-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(7rem, 1fr));
  border-top: 1px solid hsla(0, 0%, 100%, 0.1);
  overflow-x: auto;
}

.dag-kolom {
  border-right: 1px solid hsla(0, 0%, 100%, 0.1);
  padding-bottom: var(--space-m);
}

.dag-kolom:last-child {
  border-right: none;
}

.dag-header {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: var(--space-m);
  border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);
}

.dag-header__label {
  font-weight: 700;
  font-size: 0.9rem;
  line-height: 1.2;
}

.dag-header__datum {
  font-size: 0.8rem;
  line-height: 1.2;
  color: hsl(0, 0%, 70%);
}

.dag-header--vandaag {
  background: hsla(0, 0%, 100%, 0.1);
}

.sectie {
  margin-top: var(--space-s);
}

.sectie__header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: var(--space-xs) var(--space-m);
  color: hsl(0, 0%, 75%);
}

.sectie__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.sectie--bediening .sectie__header {
  background: hsla(38, 60%, 55%, 0.15);
}
.sectie--bediening .sectie__dot {
  background: hsl(38, 70%, 65%);
}
.sectie--bediening .dienst-kaart {
  border-left-color: hsl(38, 70%, 65%);
}

.sectie--keuken .sectie__header {
  background: hsla(0, 0%, 100%, 0.08);
}
.sectie--keuken .sectie__dot {
  background: hsl(220, 70%, 68%);
}
.sectie--keuken .dienst-kaart {
  border-left-color: hsl(220, 70%, 68%);
}

.sectie--spoelkeuken .sectie__header {
  background: hsla(var(--c-success-h), 60%, 45%, 0.15);
}
.sectie--spoelkeuken .sectie__dot {
  background: hsl(var(--c-success-h), 55%, 60%);
}
.sectie--spoelkeuken .dienst-kaart {
  border-left-color: hsl(var(--c-success-h), 55%, 60%);
}

.dienst-kaart {
  width: 100%;
  margin: var(--space-xs) 0 0;
  background: hsla(0, 0%, 100%, 0.05);
  border: 1px solid hsla(0, 0%, 100%, 0.1);
  border-left: 3px solid;
  padding: var(--space-xs) var(--space-s);
}

.dienst-kaart__tijd {
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
}

.dienst-kaart__naam {
  font-size: 0.75rem;
  color: hsl(0, 0%, 72%);
}

.dienst-toevoegen {
  display: block;
  width: calc(100% - 2 * var(--space-m));
  margin: var(--space-s) var(--space-m) 0;
  font-size: 0.9rem;
  color: hsl(0, 0%, 60%);
  background: transparent;
  border: 1px dashed hsla(0, 0%, 100%, 0.2);
  border-radius: var(--radius);
  padding: var(--space-xs);
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
}

.dienst-toevoegen:hover {
  background: hsla(0, 0%, 100%, 0.06);
  color: hsl(0, 0%, 85%);
}

@media (max-width: 40rem) {
  .diensten-card__header {
    flex-direction: column;
    justify-content: center;
    text-align: center;
    padding: 1.8rem var(--space-m);
  }

  .week-nav {
    gap: var(--space-m);
  }

  .week-nav__label {
    font-size: 0.85rem;
  }

  .diensten-grid {
    grid-template-columns: 1fr;
    gap: var(--space-l);
    padding: var(--space-m);
    overflow-x: visible;
  }

  .dag-kolom {
    border: 1px solid hsla(0, 0%, 100%, 0.15);
    border-radius: var(--radius);
    background: hsla(0, 0%, 100%, 0.03);
  }
}
</style>
