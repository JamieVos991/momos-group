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

const dagen = [
  {
    key: "ma",
    label: "MA",
    datum: "17 aug",
    vandaag: false,
    diensten: {
      bediening: [
        { tijd: "12:00–22:00", naam: "Megan" },
        { tijd: "12:00–22:00", naam: "Mario" },
        { tijd: "12:00–22:00", naam: "Moise" },
      ],
      keuken: [{ tijd: "11:45–22:00", naam: "Ashley" }],
      spoelkeuken: [],
    },
  },
  {
    key: "di",
    label: "DI",
    datum: "18 aug",
    vandaag: false,
    diensten: {
      bediening: [
        { tijd: "18:00–22:00", naam: "Megan" },
        { tijd: "11:45–22:00", naam: "Chanelle" },
      ],
      keuken: [
        { tijd: "17:00–22:00", naam: "Mario" },
        { tijd: "11:45–17:00", naam: "Ashley" },
      ],
      spoelkeuken: [],
    },
  },
  {
    key: "wo",
    label: "WO",
    datum: "19 aug",
    vandaag: false,
    diensten: {
      bediening: [
        { tijd: "17:00–22:00", naam: "Megan" },
        { tijd: "11:45–22:00", naam: "Chanelle" },
      ],
      keuken: [{ tijd: "11:45–22:00", naam: "Mario" }],
      spoelkeuken: [],
    },
  },
  {
    key: "do",
    label: "DO",
    datum: "20 aug",
    vandaag: false,
    diensten: {
      bediening: [
        { tijd: "17:00–22:00", naam: "Megan" },
        { tijd: "11:45–22:00", naam: "Chanelle" },
      ],
      keuken: [{ tijd: "11:30–22:00", naam: "Mario" }],
      spoelkeuken: [],
    },
  },
  {
    key: "vr",
    label: "VR",
    datum: "21 aug",
    vandaag: true,
    diensten: {
      bediening: [
        { tijd: "11:45–22:00", naam: "Chanelle" },
        { tijd: "12:00–22:00", naam: "Megan" },
      ],
      keuken: [{ tijd: "12:00–22:00", naam: "Mario" }],
      spoelkeuken: [{ tijd: "12:00–18:00", naam: "Senna" }],
    },
  },
  {
    key: "za",
    label: "ZA",
    datum: "22 aug",
    vandaag: false,
    diensten: {
      bediening: [
        { tijd: "14:00–22:00", naam: "Chanelle" },
        { tijd: "12:00–22:00", naam: "Megan" },
        { tijd: "12:00–20:00", naam: "Moise" },
      ],
      keuken: [{ tijd: "12:00–22:00", naam: "Mario" }],
      spoelkeuken: [
        { tijd: "12:00–17:00", naam: "Senna" },
        { tijd: "17:00–21:00", naam: "Armin" },
        { tijd: "14:00–21:00", naam: "Guiliome" },
      ],
    },
  },
  {
    key: "zo",
    label: "ZO",
    datum: "23 aug",
    vandaag: false,
    diensten: {
      bediening: [
        { tijd: "12:00–22:00", naam: "Chanelle" },
        { tijd: "12:00–22:00", naam: "Moise" },
        { tijd: "11:30–17:00", naam: "Jamie" },
      ],
      keuken: [
        { tijd: "12:00–22:00", naam: "Mario" },
        { tijd: "12:00–22:00", naam: "Megan" },
      ],
      spoelkeuken: [{ tijd: "16:00–21:00", naam: "Guiliome" }],
    },
  },
];
</script>

<template>
  <div class="diensten-card">
    <header class="diensten-card__header">
      <h2 class="diensten-card__title">Geplande diensten</h2>

      <div class="week-nav">
        <button type="button" class="week-nav__btn" aria-label="Vorige week">
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
        <span class="week-nav__label">17 aug – 23 aug</span>
        <button
          type="button"
          class="week-nav__btn"
          aria-label="Kies week in agenda"
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
        </button>
        <button type="button" class="week-nav__btn" aria-label="Volgende week">
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

          <div
            v-for="(dienst, i) in dag.diensten[functie.key]"
            :key="i"
            class="dienst-kaart"
          >
            <p class="dienst-kaart__tijd">{{ dienst.tijd }}</p>
            <p class="dienst-kaart__naam">{{ dienst.naam }}</p>
          </div>

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
