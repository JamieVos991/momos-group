<script setup>
import { addDoc, collection, onSnapshot, query, where } from "firebase/firestore";

definePageMeta({ layout: "medewerker" });

useHead({
  title: "Verlof",
});

const auth = useFirebaseAuth();
const firestore = useFirestore();

const maandLabels = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

function formatDatum(isoDatum) {
  const [, maand, dag] = isoDatum.split("-").map(Number);
  return `${dag} ${maandLabels[maand - 1]}`;
}

function formatPeriode(start, eind) {
  return start === eind
    ? formatDatum(start)
    : `${formatDatum(start)} – ${formatDatum(eind)}`;
}

const statusLabels = {
  behandeling: "In behandeling",
  goedgekeurd: "Goedgekeurd",
  afgewezen: "Afgewezen",
};

const medewerker = ref(null);
const aanvragen = ref([]);
const laden = ref(true);
const foutmelding = ref("");

let stopMedewerkerListener = null;
let stopAanvragenListener = null;

onMounted(() => {
  const email = auth.currentUser?.email;
  if (!email) {
    laden.value = false;
    return;
  }

  stopMedewerkerListener = onSnapshot(
    query(collection(firestore, "medewerkers"), where("email", "==", email.toLowerCase())),
    (snapshot) => {
      medewerker.value = snapshot.docs[0]?.data() ?? null;

      stopAanvragenListener?.();
      if (!medewerker.value) {
        laden.value = false;
        return;
      }

      stopAanvragenListener = onSnapshot(
        query(collection(firestore, "verlofaanvragen"), where("naam", "==", medewerker.value.naam)),
        (aanvragenSnapshot) => {
          aanvragen.value = aanvragenSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          laden.value = false;
          foutmelding.value = "";
        },
        () => {
          laden.value = false;
          foutmelding.value = "Kon je verlofaanvragen niet laden. Controleer de Firestore-rechten.";
        }
      );
    },
    () => {
      laden.value = false;
      foutmelding.value = "Kon je gegevens niet laden. Controleer de Firestore-rechten.";
    }
  );
});

onUnmounted(() => {
  stopMedewerkerListener?.();
  stopAanvragenListener?.();
});

const gesorteerdeAanvragen = computed(() =>
  [...aanvragen.value].sort((a, b) => a.start.localeCompare(b.start))
);

const nieuweAanvraag = reactive({ start: "", eind: "", reden: "" });
const aangeraakt = reactive({ start: false, eind: false, reden: false });
const verstuurd = ref(false);
const verzendBezig = ref(false);

const isGeldig = computed(
  () => nieuweAanvraag.start && nieuweAanvraag.eind && nieuweAanvraag.reden.trim()
);

function markeerAangeraakt(veld) {
  aangeraakt[veld] = true;
}

function veldStatusKlasse(veld) {
  if (!aangeraakt[veld]) return "";
  const waarde =
    veld === "reden" ? nieuweAanvraag[veld].trim() : nieuweAanvraag[veld];
  return waarde ? "verlof-form__veld--geldig" : "verlof-form__veld--ongeldig";
}

async function versturen() {
  if (!isGeldig.value || !medewerker.value || verzendBezig.value) return;
  verzendBezig.value = true;
  foutmelding.value = "";
  try {
    await addDoc(collection(firestore, "verlofaanvragen"), {
      naam: medewerker.value.naam,
      start: nieuweAanvraag.start,
      eind: nieuweAanvraag.eind,
      reden: nieuweAanvraag.reden.trim(),
      status: "behandeling",
    });
    nieuweAanvraag.start = "";
    nieuweAanvraag.eind = "";
    nieuweAanvraag.reden = "";
    aangeraakt.start = false;
    aangeraakt.eind = false;
    aangeraakt.reden = false;
    verstuurd.value = true;
  } catch {
    foutmelding.value = "Versturen mislukt. Controleer de Firestore-rechten.";
  } finally {
    verzendBezig.value = false;
  }
}
</script>

<template>
  <article class="verlof-card">
    <section class="verlof-aanvraag">
      <h2 class="verlof-aanvraag__titel">Verlof aanvragen</h2>

      <p v-if="!laden && !medewerker" class="verlof-melding verlof-melding--fout">
        Er is nog geen medewerkersprofiel gekoppeld aan jouw account. Vraag de beheerder om je e-mailadres toe te voegen.
      </p>

      <form class="verlof-form" novalidate @submit.prevent="versturen">
        <fieldset class="verlof-form__tijden">
          <legend class="sr-only">Periode</legend>

          <label class="verlof-form__veld" :class="veldStatusKlasse('start')">
            <span>Startdatum</span>
            <input
              v-model="nieuweAanvraag.start"
              type="date"
              required
              @blur="markeerAangeraakt('start')"
            />
          </label>

          <label class="verlof-form__veld" :class="veldStatusKlasse('eind')">
            <span>Einddatum</span>
            <input
              v-model="nieuweAanvraag.eind"
              type="date"
              required
              @blur="markeerAangeraakt('eind')"
            />
          </label>
        </fieldset>

        <label class="verlof-form__veld" :class="veldStatusKlasse('reden')">
          <span>Reden</span>
          <textarea
            v-model="nieuweAanvraag.reden"
            rows="3"
            placeholder="Bijv. vakantie, familiebezoek..."
            required
            @blur="markeerAangeraakt('reden')"
          />
        </label>

        <p v-if="verstuurd" class="verlof-melding verlof-melding--succes" role="status">
          Je aanvraag is verstuurd. Je ontvangt bericht zodra deze is beoordeeld.
        </p>
        <p v-if="foutmelding" class="verlof-melding verlof-melding--fout" role="alert">
          {{ foutmelding }}
        </p>

        <button
          type="submit"
          class="verlof-form__versturen"
          :disabled="!isGeldig || !medewerker || verzendBezig"
        >
          {{ verzendBezig ? "Versturen..." : "Aanvraag versturen" }}
        </button>
      </form>
    </section>

    <section class="verlof-lijst-sectie">
      <h2 class="verlof-lijst-sectie__titel">Mijn aanvragen</h2>

      <p v-if="laden" class="verlof-lijst__leeg">Laden...</p>

      <ul v-else class="verlof-lijst">
        <li v-if="!gesorteerdeAanvragen.length" class="verlof-lijst__leeg">
          Je hebt nog geen verlofaanvragen ingediend.
        </li>
        <li v-for="aanvraag in gesorteerdeAanvragen" :key="aanvraag.id" class="verlof-item">
          <p class="verlof-item__periode">
            {{ formatPeriode(aanvraag.start, aanvraag.eind) }}
            <small class="verlof-item__reden">{{ aanvraag.reden }}</small>
          </p>
          <span class="verlof-item__status" :class="`status--${aanvraag.status}`">
            {{ statusLabels[aanvraag.status] }}
          </span>
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.verlof-card {
  background: var(--c-navy);
  color: var(--c-light);
  border-radius: var(--radius);
  box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.35);
  padding: var(--space-l);
  display: flex;
  flex-direction: column;
  gap: var(--space-l);
}

.verlof-aanvraag__titel,
.verlof-lijst-sectie__titel {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: var(--space-m);
}

.verlof-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-m);
}

.verlof-form__tijden {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-m);
  border: none;
  margin: 0;
  padding: 0;
}

.verlof-form__veld {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: hsl(0, 0%, 65%);

  input,
  textarea {
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
    resize: vertical;
    font-family: inherit;

    &::placeholder {
      color: hsl(0, 0%, 50%);
    }

    &:hover {
      border-color: hsla(0, 0%, 100%, 0.25);
    }

    &:focus {
      outline: none;
      border-color: hsla(0, 0%, 100%, 0.4);
    }
  }
}

.verlof-form__veld--geldig {
  input,
  textarea {
    border-color: hsl(var(--c-success-h), var(--c-success-s), 55%);
  }
}

.verlof-form__veld--ongeldig {
  input,
  textarea {
    border-color: hsl(var(--c-error-h), var(--c-error-s), 60%);
  }
}

.verlof-melding {
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: var(--radius);
  padding: var(--space-s) var(--space-m);
}

.verlof-melding--succes {
  color: hsl(var(--c-success-h), var(--c-success-s), 80%);
  background: hsla(var(--c-success-h), var(--c-success-s), 45%, 0.2);
  border: 1px solid hsla(var(--c-success-h), var(--c-success-s), 45%, 0.4);
}

.verlof-melding--fout {
  color: hsl(var(--c-error-h), var(--c-error-s), 85%);
  background: hsla(var(--c-error-h), var(--c-error-s), 45%, 0.2);
  border: 1px solid hsla(var(--c-error-h), var(--c-error-s), 45%, 0.4);
}

.verlof-form__versturen {
  align-self: flex-start;
  font: inherit;
  font-weight: 700;
  color: #fff;
  background: hsl(231, 40%, 52%);
  border: none;
  border-radius: var(--radius);
  padding: 0.6rem 1.4rem;
  cursor: pointer;
  transition: background var(--transition), opacity var(--transition);
}

.verlof-form__versturen:hover:not(:disabled) {
  background: hsl(231, 40%, 45%);
}

.verlof-form__versturen:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.verlof-lijst-sectie {
  border-top: 1px solid hsla(0, 0%, 100%, 0.1);
  padding-top: var(--space-l);
}

.verlof-lijst {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-s);
}

.verlof-lijst__leeg {
  font-size: 0.85rem;
  color: hsl(0, 0%, 65%);
}

.verlof-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-m);
  background: hsla(0, 0%, 100%, 0.05);
  border: 1px solid hsla(0, 0%, 100%, 0.1);
  border-radius: var(--radius);
  padding: var(--space-s) var(--space-m);
}

.verlof-item__periode {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 600;
}

.verlof-item__reden {
  display: block;
  font-size: 0.8rem;
  font-weight: 400;
  color: hsl(0, 0%, 65%);
  margin-top: 0.15rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.verlof-item__status {
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius);
  white-space: nowrap;
}

.status--goedgekeurd {
  color: hsl(var(--c-success-h), var(--c-success-s), 75%);
  background: hsla(var(--c-success-h), var(--c-success-s), 45%, 0.2);
}

.status--behandeling {
  color: hsl(var(--c-warning-h), var(--c-warning-s), 75%);
  background: hsla(var(--c-warning-h), var(--c-warning-s), 45%, 0.2);
}

.status--afgewezen {
  color: hsl(var(--c-error-h), var(--c-error-s), 80%);
  background: hsla(var(--c-error-h), var(--c-error-s), 55%, 0.2);
}

@media (max-width: 40rem) {
  .verlof-card {
    padding: var(--space-m);
  }

  .verlof-form__tijden {
    grid-template-columns: 1fr;
  }

  .verlof-form__versturen {
    align-self: stretch;
  }

  .verlof-item {
    flex-wrap: wrap;
  }
}
</style>
