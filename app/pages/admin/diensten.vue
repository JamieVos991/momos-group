<script setup>
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";

definePageMeta({ layout: "admin" });

useHead({
  title: "Diensten",
});

const functies = [
  { key: "bediening", label: "Bediening" },
  { key: "keuken", label: "Keuken" },
  { key: "spoelkeuken", label: "Spoelkeuken" },
];

const firestore = useFirestore();
const medewerkers = ref([]);
let stopMedewerkersListener = null;

onMounted(() => {
  stopMedewerkersListener = onSnapshot(
    collection(firestore, "medewerkers"),
    (snapshot) => {
      medewerkers.value = snapshot.docs.map((d) => d.data());
    },
    () => {
      medewerkers.value = [];
    }
  );
});

onUnmounted(() => {
  stopMedewerkersListener?.();
});

const dienstenData = ref({});
const foutmelding = ref("");
let stopDienstenListener = null;

onMounted(() => {
  stopDienstenListener = onSnapshot(
    collection(firestore, "diensten"),
    (snapshot) => {
      const nieuw = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (!nieuw[data.datum]) {
          nieuw[data.datum] = { bediening: [], keuken: [], spoelkeuken: [] };
        }
        nieuw[data.datum][data.functie]?.push({ tijd: data.tijd, naam: data.naam, id: d.id });
      });
      dienstenData.value = nieuw;
    },
    () => {
      foutmelding.value = "Kon diensten niet laden. Controleer de Firestore-rechten.";
    }
  );
});

onUnmounted(() => {
  stopDienstenListener?.();
});

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

function isoKey(d) {
  const jaar = d.getFullYear();
  const maand = String(d.getMonth() + 1).padStart(2, "0");
  const dag = String(d.getDate()).padStart(2, "0");
  return `${jaar}-${maand}-${dag}`;
}

const weekStart = ref(geefMaandag(new Date()));

const dagen = computed(() =>
  dagLabels.map((label, i) => {
    const datum = new Date(weekStart.value);
    datum.setDate(datum.getDate() + i);
    const iso = isoKey(datum);
    return {
      key: label.toLowerCase(),
      iso,
      label,
      datum: formatDatum(datum),
      vandaag: isVandaag(datum),
      diensten: dienstenData.value[iso] || { bediening: [], keuken: [], spoelkeuken: [] },
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

const presets = [
  { label: "Lunch 12:00–17:00", start: "12:00", eind: "17:00" },
  { label: "Diner 16:00–22:00", start: "16:00", eind: "22:00" },
  { label: "Dubbel 12:00–22:00", start: "12:00", eind: "22:00" },
];

const modalOpen = ref(false);
const modalDag = ref(null);
const bewerkDienstId = ref(null);
const nieuweDienst = reactive({
  naam: "",
  functie: "bediening",
  start: "12:00",
  eind: "22:00",
  heleWeek: false,
});

const beschikbareMedewerkers = computed(() =>
  medewerkers.value
    .filter((m) => m.functies?.includes(nieuweDienst.functie))
    .map((m) => m.naam)
);

watch(
  () => nieuweDienst.functie,
  () => {
    if (!beschikbareMedewerkers.value.includes(nieuweDienst.naam)) {
      nieuweDienst.naam = "";
    }
  }
);

function openDienstModal(dag, functie) {
  modalDag.value = dag;
  bewerkDienstId.value = null;
  nieuweDienst.naam = "";
  nieuweDienst.functie = functie.key;
  nieuweDienst.start = "12:00";
  nieuweDienst.eind = "22:00";
  nieuweDienst.heleWeek = false;
  modalOpen.value = true;
}

function openBewerkModal(dag, functieKey, dienst) {
  const [start, eind] = dienst.tijd.split("–");
  modalDag.value = dag;
  bewerkDienstId.value = dienst.id;
  nieuweDienst.naam = dienst.naam;
  nieuweDienst.functie = functieKey;
  nieuweDienst.start = start;
  nieuweDienst.eind = eind;
  nieuweDienst.heleWeek = false;
  modalOpen.value = true;
}

function sluitDienstModal() {
  modalOpen.value = false;
}

function zetPreset(start, eind) {
  nieuweDienst.start = start;
  nieuweDienst.eind = eind;
}

const opslaanBezig = ref(false);

async function dienstOpslaan() {
  if (!nieuweDienst.start || !nieuweDienst.eind || opslaanBezig.value) return;
  opslaanBezig.value = true;
  const dienst = {
    tijd: `${nieuweDienst.start}–${nieuweDienst.eind}`,
    naam: nieuweDienst.naam,
    functie: nieuweDienst.functie,
  };
  try {
    if (bewerkDienstId.value) {
      await updateDoc(doc(firestore, "diensten", bewerkDienstId.value), dienst);
    } else {
      const doelDagen = nieuweDienst.heleWeek ? dagen.value : [modalDag.value];
      await Promise.all(
        doelDagen.map((dag) =>
          addDoc(collection(firestore, "diensten"), { ...dienst, datum: dag.iso })
        )
      );
    }
    sluitDienstModal();
  } catch {
    foutmelding.value = "Opslaan mislukt. Controleer de Firestore-rechten.";
  } finally {
    opslaanBezig.value = false;
  }
}

async function dienstVerwijderen() {
  if (!bewerkDienstId.value || opslaanBezig.value) return;
  opslaanBezig.value = true;
  try {
    await deleteDoc(doc(firestore, "diensten", bewerkDienstId.value));
    sluitDienstModal();
  } catch {
    foutmelding.value = "Verwijderen mislukt. Controleer de Firestore-rechten.";
  } finally {
    opslaanBezig.value = false;
  }
}
</script>

<template>
  <div class="diensten-card">
    <header class="diensten-card__header">
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

    <p v-if="foutmelding" class="diensten-melding">{{ foutmelding }}</p>

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
            :key="dienst.id || i"
            class="dienst-kaart"
            @click="openBewerkModal(dag, functie.key, dienst)"
          >
            <p class="dienst-kaart__tijd">{{ dienst.tijd }}</p>
            <p class="dienst-kaart__naam">{{ dienst.naam }}</p>
          </div>

          <button
            type="button"
            class="dienst-toevoegen"
            @click="openDienstModal(dag, functie)"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <div v-if="modalOpen" class="dienst-modal__overlay" @click.self="sluitDienstModal">
      <div class="dienst-modal">
        <div class="dienst-modal__kop">
          <div>
            <h3 class="dienst-modal__titel">
              {{ bewerkDienstId ? "Dienst bewerken" : "Dienst toevoegen" }}
            </h3>
            <p class="dienst-modal__subtitel">
              {{ modalDag?.label }} {{ modalDag?.datum }}
            </p>
          </div>
          <button
            type="button"
            class="dienst-modal__sluiten"
            aria-label="Sluiten"
            @click="sluitDienstModal"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <form class="dienst-modal__form" @submit.prevent="dienstOpslaan">
          <label class="dienst-modal__veld">
            <span>Naam</span>
            <select v-model="nieuweDienst.naam">
              <option value="" disabled>Kies medewerker</option>
              <option v-for="naam in beschikbareMedewerkers" :key="naam" :value="naam">
                {{ naam }}
              </option>
            </select>
          </label>

          <div class="dienst-modal__veld">
            <span>Functie</span>
            <div class="dienst-modal__functies">
              <button
                v-for="f in functies"
                :key="f.key"
                type="button"
                class="dienst-modal__functie-btn"
                :class="[
                  `sectie--${f.key}`,
                  { 'dienst-modal__functie-btn--actief': nieuweDienst.functie === f.key },
                ]"
                @click="nieuweDienst.functie = f.key"
              >
                <span class="sectie__dot" />
                {{ f.label.toUpperCase() }}
              </button>
            </div>
          </div>

          <div class="dienst-modal__tijden">
            <label class="dienst-modal__veld">
              <span>Begintijd</span>
              <input v-model="nieuweDienst.start" type="time" required />
            </label>

            <label class="dienst-modal__veld">
              <span>Eindtijd</span>
              <input v-model="nieuweDienst.eind" type="time" required />
            </label>
          </div>

          <div class="dienst-modal__presets">
            <button
              v-for="preset in presets"
              :key="preset.label"
              type="button"
              class="dienst-modal__preset"
              @click="zetPreset(preset.start, preset.eind)"
            >
              {{ preset.label }}
            </button>
          </div>

          <label v-if="!bewerkDienstId" class="dienst-modal__toggle">
            <input v-model="nieuweDienst.heleWeek" type="checkbox" />
            <span class="dienst-modal__toggle-track">
              <span class="dienst-modal__toggle-knop" />
            </span>
            <span class="dienst-modal__toggle-tekst">
              <strong>Toepassen op hele week</strong>
              <small>Voegt dezelfde dienst toe op ma t/m zo.</small>
            </span>
          </label>

          <p v-if="foutmelding" class="dienst-modal__foutmelding">{{ foutmelding }}</p>

          <div class="dienst-modal__acties">
            <button
              type="submit"
              class="dienst-modal__btn dienst-modal__btn--opslaan"
              :disabled="opslaanBezig"
            >
              {{ opslaanBezig ? "Opslaan..." : bewerkDienstId ? "Opslaan" : "Dienst toevoegen" }}
            </button>
            <button
              v-if="bewerkDienstId"
              type="button"
              class="dienst-modal__btn dienst-modal__btn--verwijderen"
              :disabled="opslaanBezig"
              @click="dienstVerwijderen"
            >
              Verwijderen
            </button>
          </div>
        </form>
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
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
  padding: var(--space-m);
}

.diensten-melding {
  font-size: 0.85rem;
  color: hsl(0, 70%, 75%);
  padding: 0 var(--space-m) var(--space-m);
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
  cursor: pointer;
  transition: background var(--transition);
}

.dienst-kaart:hover {
  background: hsla(0, 0%, 100%, 0.1);
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

.dienst-modal__overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  padding: var(--space-m);
  z-index: 100;
}

.dienst-modal {
  width: 100%;
  max-width: 24rem;
  max-height: calc(100vh - 2 * var(--space-m));
  overflow-y: auto;
  background: var(--c-primary);
  color: var(--c-light);
  border-radius: 1rem;
  padding: var(--space-l);
  box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.4);
}

.dienst-modal__kop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-m);
  padding-bottom: var(--space-m);
  margin-bottom: var(--space-m);
  border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);
}

.dienst-modal__titel {
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
}

.dienst-modal__subtitel {
  font-size: 0.85rem;
  color: hsl(0, 0%, 70%);
  margin-top: var(--space-xs);
}

.dienst-modal__sluiten {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  color: #fff;
  background: transparent;
  border: 1px solid hsla(0, 0%, 100%, 0.2);
  border-radius: 50%;
  cursor: pointer;
  transition: background var(--transition);

  svg {
    width: 1rem;
    height: 1rem;
  }

  &:hover {
    background: hsla(0, 0%, 100%, 0.1);
  }
}

.dienst-modal__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-m);
}

.dienst-modal__veld {
  display: flex;
  flex-direction: column;
  gap: 15px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: hsl(0, 0%, 65%);

  input,
  select {
    font: inherit;
    font-size: 0.95rem;
    font-weight: 400;
    letter-spacing: normal;
    color: #fff;
    background: hsla(0, 0%, 100%, 0.06);
    border: 1px solid hsla(0, 0%, 100%, 0.15);
    border-radius: var(--radius);
    padding: 0.65rem 0.9rem;
    color-scheme: dark;

    option {
      color: var(--c-dark);
    }

    &::placeholder {
      color: hsl(0, 0%, 50%);
    }

    &:focus {
      outline: none;
      border-color: hsla(0, 0%, 100%, 0.4);
    }
  }

  select {
    appearance: none;
    padding-right: 2.5rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.85rem center;
    background-size: 0.9rem;
  }
}

.dienst-modal__tijden {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-m);
}

.dienst-modal__functies {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-s);
}

.dienst-modal__functie-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: hsl(0, 0%, 70%);
  background: transparent;
  border: 1px solid hsla(0, 0%, 100%, 0.15);
  border-radius: 999px;
  padding: 0.5rem 0.9rem;
  cursor: pointer;
  transition: background var(--transition), border-color var(--transition);
}

.dienst-modal__functie-btn--actief {
  color: #fff;
  background: hsla(0, 0%, 100%, 0.08);
  border-color: hsla(0, 0%, 100%, 0.35);
}

.dienst-modal__presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-s);
}

.dienst-modal__preset {
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  color: hsl(0, 0%, 80%);
  background: hsla(0, 0%, 100%, 0.06);
  border: 1px solid hsla(0, 0%, 100%, 0.15);
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  cursor: pointer;
  transition: background var(--transition);
}

.dienst-modal__preset:hover {
  background: hsla(0, 0%, 100%, 0.12);
}

.dienst-modal__toggle {
  display: flex;
  align-items: center;
  gap: var(--space-m);
  padding: 1rem 0;
  cursor: pointer;

  input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
}

.dienst-modal__toggle-track {
  flex-shrink: 0;
  width: 2.5rem;
  height: 1.4rem;
  border-radius: 999px;
  background: hsla(0, 0%, 100%, 0.15);
  padding: 0.15rem;
  transition: background var(--transition);
}

.dienst-modal__toggle-knop {
  display: block;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  background: #fff;
  transition: transform var(--transition);
}

.dienst-modal__toggle input:checked + .dienst-modal__toggle-track {
  background: hsl(166, 40%, 45%);
}

.dienst-modal__toggle input:checked + .dienst-modal__toggle-track .dienst-modal__toggle-knop {
  transform: translateX(1.1rem);
}

.dienst-modal__toggle-tekst {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.8rem;

  strong {
    color: #fff;
  }

  small {
    color: hsl(0, 0%, 65%);
  }
}

.dienst-modal__acties {
  display: flex;
  justify-content: flex-start;
  gap: var(--space-s);
  margin-top: var(--space-xs);
}

.dienst-modal__btn {
  font: inherit;
  font-weight: 700;
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1.4rem;
  cursor: pointer;
  transition: background var(--transition), opacity var(--transition);
}

.dienst-modal__btn--opslaan {
  background: hsl(231, 65%, 78%);
  color: var(--c-primary);
}

.dienst-modal__btn--opslaan:hover {
  background: hsl(231, 65%, 72%);
}

.dienst-modal__btn--opslaan:disabled {
  opacity: 0.6;
  cursor: progress;
}

.dienst-modal__btn--verwijderen {
  color: hsl(0, 70%, 78%);
  background: hsla(0, 70%, 60%, 0.12);
}

.dienst-modal__btn--verwijderen:hover {
  background: hsla(0, 70%, 60%, 0.2);
}

.dienst-modal__btn--verwijderen:disabled {
  opacity: 0.6;
  cursor: progress;
}

.dienst-modal__foutmelding {
  font-size: 0.8rem;
  color: hsl(0, 70%, 75%);
}
</style>
