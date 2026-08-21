<script setup>
import { addDoc, collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";

definePageMeta({ layout: "admin" });

useHead({
  title: "Functies",
});

const functies = [
  { key: "bediening", label: "Bediening" },
  { key: "keuken", label: "Keuken" },
  { key: "spoelkeuken", label: "Spoelkeuken" },
];

const firestore = useFirestore();
const medewerkers = ref([]);
const laden = ref(true);
const foutmelding = ref("");

let stopListener = null;

onMounted(() => {
  stopListener = onSnapshot(
    collection(firestore, "medewerkers"),
    (snapshot) => {
      medewerkers.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      laden.value = false;
      foutmelding.value = "";
    },
    () => {
      laden.value = false;
      foutmelding.value = "Kon medewerkers niet laden. Controleer de Firestore-rechten.";
    }
  );
});

onUnmounted(() => {
  stopListener?.();
});

const nieuweMedewerker = reactive({ naam: "", email: "", functies: ["bediening"] });
const bezig = ref(false);

function functieToggle(key) {
  const i = nieuweMedewerker.functies.indexOf(key);
  if (i === -1) nieuweMedewerker.functies.push(key);
  else nieuweMedewerker.functies.splice(i, 1);
}

async function medewerkerToevoegen() {
  if (
    !nieuweMedewerker.naam.trim() ||
    !nieuweMedewerker.email.trim() ||
    !nieuweMedewerker.functies.length ||
    bezig.value
  )
    return;
  bezig.value = true;
  try {
    await addDoc(collection(firestore, "medewerkers"), {
      naam: nieuweMedewerker.naam.trim(),
      email: nieuweMedewerker.email.trim().toLowerCase(),
      functies: [...nieuweMedewerker.functies],
    });
    nieuweMedewerker.naam = "";
    nieuweMedewerker.email = "";
  } catch {
    foutmelding.value = "Opslaan mislukt. Controleer de Firestore-rechten.";
  } finally {
    bezig.value = false;
  }
}

async function medewerkerVerwijderen(id) {
  try {
    await deleteDoc(doc(firestore, "medewerkers", id));
  } catch {
    foutmelding.value = "Verwijderen mislukt. Controleer de Firestore-rechten.";
  }
}

function functieLabel(key) {
  return functies.find((f) => f.key === key)?.label ?? key;
}
</script>

<template>
  <div class="functies-card">
    <header class="functies-card__header">
      <h2 class="functies-card__title">Medewerkers</h2>
    </header>

    <p v-if="foutmelding" class="functies-melding">{{ foutmelding }}</p>

    <form class="medewerker-form" @submit.prevent="medewerkerToevoegen">
      <input
        v-model="nieuweMedewerker.naam"
        type="text"
        placeholder="Naam medewerker"
        required
      />

      <input
        v-model="nieuweMedewerker.email"
        type="email"
        placeholder="E-mailadres"
        required
      />

      <div class="medewerker-form__functies">
        <button
          v-for="f in functies"
          :key="f.key"
          type="button"
          class="medewerker-form__functie-btn"
          :class="[
            `sectie--${f.key}`,
            { 'medewerker-form__functie-btn--actief': nieuweMedewerker.functies.includes(f.key) },
          ]"
          @click="functieToggle(f.key)"
        >
          <span class="sectie__dot" />
          {{ f.label.toUpperCase() }}
        </button>
      </div>

      <button type="submit" class="medewerker-form__toevoegen" :disabled="bezig">
        Medewerker toevoegen
      </button>
    </form>

    <p v-if="laden" class="functies-melding">Laden...</p>

    <ul v-else class="medewerker-lijst">
      <li v-if="!medewerkers.length" class="medewerker-lijst__leeg">
        Nog geen medewerkers toegevoegd.
      </li>
      <li v-for="mw in medewerkers" :key="mw.id" class="medewerker-item">
        <div class="medewerker-item__badges">
          <span
            v-for="key in mw.functies || []"
            :key="key"
            class="medewerker-item__badge"
            :class="`sectie--${key}`"
          >
            <span class="sectie__dot" />
            {{ functieLabel(key).toUpperCase() }}
          </span>
        </div>
        <div class="medewerker-item__info">
          <span class="medewerker-item__naam">{{ mw.naam }}</span>
          <span v-if="mw.email" class="medewerker-item__email">{{ mw.email }}</span>
        </div>
        <button
          type="button"
          class="medewerker-item__verwijderen"
          aria-label="Verwijderen"
          @click="medewerkerVerwijderen(mw.id)"
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
      </li>
    </ul>
  </div>
</template>

<style scoped>
.functies-card {
  background: var(--c-navy);
  color: var(--c-light);
  border-radius: var(--radius);
  box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.35);
  padding: var(--space-l);
}

.functies-card__header {
  margin-bottom: var(--space-m);
}

.functies-card__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.functies-melding {
  font-size: 0.85rem;
  color: hsl(0, 0%, 70%);
  margin-bottom: var(--space-m);
}

.medewerker-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-m);
  padding-bottom: var(--space-l);
  margin-bottom: var(--space-l);
  border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);

  input {
    flex: 1;
    min-width: 12rem;
    font: inherit;
    color: #fff;
    background: hsla(0, 0%, 100%, 0.06);
    border: 1px solid hsla(0, 0%, 100%, 0.15);
    border-radius: var(--radius);
    padding: 0.65rem 0.9rem;

    &::placeholder {
      color: hsl(0, 0%, 55%);
    }

    &:focus {
      outline: none;
      border-color: hsla(0, 0%, 100%, 0.4);
    }
  }
}

.medewerker-form__functies {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-s);
}

.medewerker-form__functie-btn {
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

.medewerker-form__functie-btn--actief {
  color: #fff;
  background: hsla(0, 0%, 100%, 0.08);
  border-color: hsla(0, 0%, 100%, 0.35);
}

.medewerker-form__toevoegen {
  font: inherit;
  font-weight: 700;
  color: var(--c-primary);
  background: hsl(231, 65%, 78%);
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1.25rem;
  cursor: pointer;
  transition: background var(--transition), opacity var(--transition);
}

.medewerker-form__toevoegen:hover {
  background: hsl(231, 65%, 72%);
}

.medewerker-form__toevoegen:disabled {
  opacity: 0.6;
  cursor: progress;
}

.medewerker-lijst {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-s);
}

.medewerker-lijst__leeg {
  font-size: 0.85rem;
  color: hsl(0, 0%, 65%);
}

.medewerker-item {
  display: flex;
  align-items: center;
  gap: var(--space-m);
  background: hsla(0, 0%, 100%, 0.05);
  border: 1px solid hsla(0, 0%, 100%, 0.1);
  border-radius: var(--radius);
  padding: var(--space-s) var(--space-m);
}

.medewerker-item__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.medewerker-item__badge {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: hsl(0, 0%, 75%);
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
}

.sectie--bediening {
  background: hsla(38, 60%, 55%, 0.15);
}
.sectie--bediening .sectie__dot {
  background: hsl(38, 70%, 65%);
}

.sectie--keuken {
  background: hsla(0, 0%, 100%, 0.08);
}
.sectie--keuken .sectie__dot {
  background: hsl(220, 70%, 68%);
}

.sectie--spoelkeuken {
  background: hsla(var(--c-success-h), 60%, 45%, 0.15);
}
.sectie--spoelkeuken .sectie__dot {
  background: hsl(var(--c-success-h), 55%, 60%);
}

.sectie__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.medewerker-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.medewerker-item__naam {
  font-size: 0.9rem;
  font-weight: 600;
}

.medewerker-item__email {
  font-size: 0.75rem;
  color: hsl(0, 0%, 65%);
}

.medewerker-item__verwijderen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  color: hsl(0, 0%, 65%);
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background var(--transition), color var(--transition);

  svg {
    width: 0.9rem;
    height: 0.9rem;
  }

  &:hover {
    background: hsla(0, 0%, 100%, 0.1);
    color: #fff;
  }
}
</style>
