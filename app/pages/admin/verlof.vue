<script setup>
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";

definePageMeta({ layout: "admin" });

useHead({
  title: "Verlof",
});

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

const aanvragen = ref([]);
const laden = ref(true);
const foutmelding = ref("");
const bezig = ref({});

let stopListener = null;

onMounted(() => {
  stopListener = onSnapshot(
    collection(firestore, "verlofaanvragen"),
    (snapshot) => {
      aanvragen.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      laden.value = false;
      foutmelding.value = "";
    },
    () => {
      laden.value = false;
      foutmelding.value = "Kon verlofaanvragen niet laden. Controleer de Firestore-rechten.";
    }
  );
});

onUnmounted(() => {
  stopListener?.();
});

const inBehandeling = computed(() =>
  aanvragen.value
    .filter((a) => a.status === "behandeling")
    .sort((a, b) => a.start.localeCompare(b.start))
);

const afgehandeld = computed(() =>
  aanvragen.value
    .filter((a) => a.status !== "behandeling")
    .sort((a, b) => b.start.localeCompare(a.start))
);

async function beslissen(id, status) {
  bezig.value[id] = true;
  try {
    await updateDoc(doc(firestore, "verlofaanvragen", id), { status });
  } catch {
    foutmelding.value = "Bijwerken mislukt. Controleer de Firestore-rechten.";
  } finally {
    bezig.value[id] = false;
  }
}
</script>

<template>
  <div class="verlof-admin-card">
    <header class="verlof-admin-card__header">
      <h2 class="verlof-admin-card__title">Verlof</h2>
    </header>

    <p v-if="foutmelding" class="verlof-admin-melding">{{ foutmelding }}</p>
    <p v-else-if="laden" class="verlof-admin-melding">Laden...</p>

    <template v-else>
      <section class="verlof-admin-sectie">
        <h3 class="verlof-admin-sectie__titel">
          In behandeling
          <span v-if="inBehandeling.length" class="verlof-admin-badge">{{ inBehandeling.length }}</span>
        </h3>

        <p v-if="!inBehandeling.length" class="verlof-admin-leeg">
          Geen openstaande aanvragen.
        </p>

        <ul v-else class="verlof-admin-lijst">
          <li v-for="aanvraag in inBehandeling" :key="aanvraag.id" class="verlof-admin-item">
            <div class="verlof-admin-item__info">
              <p class="verlof-admin-item__naam">{{ aanvraag.naam }}</p>
              <p class="verlof-admin-item__periode">
                {{ formatPeriode(aanvraag.start, aanvraag.eind) }}
                <small>{{ aanvraag.reden }}</small>
              </p>
            </div>

            <div class="verlof-admin-item__acties">
              <button
                type="button"
                class="verlof-admin-btn verlof-admin-btn--goedkeuren"
                :disabled="bezig[aanvraag.id]"
                @click="beslissen(aanvraag.id, 'goedgekeurd')"
              >
                Goedkeuren
              </button>
              <button
                type="button"
                class="verlof-admin-btn verlof-admin-btn--afwijzen"
                :disabled="bezig[aanvraag.id]"
                @click="beslissen(aanvraag.id, 'afgewezen')"
              >
                Afwijzen
              </button>
            </div>
          </li>
        </ul>
      </section>

      <section v-if="afgehandeld.length" class="verlof-admin-sectie">
        <h3 class="verlof-admin-sectie__titel">Afgehandeld</h3>

        <ul class="verlof-admin-lijst">
          <li v-for="aanvraag in afgehandeld" :key="aanvraag.id" class="verlof-admin-item">
            <div class="verlof-admin-item__info">
              <p class="verlof-admin-item__naam">{{ aanvraag.naam }}</p>
              <p class="verlof-admin-item__periode">
                {{ formatPeriode(aanvraag.start, aanvraag.eind) }}
                <small>{{ aanvraag.reden }}</small>
              </p>
            </div>

            <span class="verlof-admin-status" :class="`status--${aanvraag.status}`">
              {{ statusLabels[aanvraag.status] }}
            </span>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
.verlof-admin-card {
  background: var(--c-navy);
  color: var(--c-light);
  border-radius: var(--radius);
  box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.35);
  padding: var(--space-l);
}

.verlof-admin-card__header {
  margin-bottom: var(--space-m);
}

.verlof-admin-card__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.verlof-admin-melding {
  font-size: 0.85rem;
  color: hsl(0, 0%, 70%);
}

.verlof-admin-sectie {
  margin-top: var(--space-l);
}

.verlof-admin-sectie:first-of-type {
  margin-top: 0;
}

.verlof-admin-sectie__titel {
  display: flex;
  align-items: center;
  gap: var(--space-s);
  font-size: 0.85rem;
  font-weight: 700;
  color: hsl(0, 0%, 75%);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-bottom: var(--space-m);
}

.verlof-admin-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.4rem;
  font-size: 0.7rem;
  color: var(--c-primary);
  background: hsl(231, 65%, 78%);
  border-radius: 999px;
}

.verlof-admin-leeg {
  font-size: 0.85rem;
  color: hsl(0, 0%, 68%);
}

.verlof-admin-lijst {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-s);
}

.verlof-admin-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-m);
  background: hsla(0, 0%, 100%, 0.05);
  border: 1px solid hsla(0, 0%, 100%, 0.1);
  border-radius: var(--radius);
  padding: var(--space-s) var(--space-m);
}

.verlof-admin-item__naam {
  font-size: 0.9rem;
  font-weight: 600;
}

.verlof-admin-item__periode {
  font-size: 0.8rem;
  color: hsl(0, 0%, 70%);
  margin-top: 0.15rem;

  small {
    display: block;
    margin-top: 0.1rem;
    color: hsl(0, 0%, 60%);
  }
}

.verlof-admin-item__acties {
  display: flex;
  gap: var(--space-s);
  flex-shrink: 0;
}

.verlof-admin-btn {
  font: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background var(--transition), opacity var(--transition);
}

.verlof-admin-btn--goedkeuren {
  color: hsl(var(--c-success-h), var(--c-success-s), 80%);
  background: hsla(var(--c-success-h), var(--c-success-s), 45%, 0.2);
}

.verlof-admin-btn--goedkeuren:hover:not(:disabled) {
  background: hsla(var(--c-success-h), var(--c-success-s), 45%, 0.32);
}

.verlof-admin-btn--afwijzen {
  color: hsl(var(--c-error-h), var(--c-error-s), 85%);
  background: hsla(var(--c-error-h), var(--c-error-s), 45%, 0.2);
}

.verlof-admin-btn--afwijzen:hover:not(:disabled) {
  background: hsla(var(--c-error-h), var(--c-error-s), 45%, 0.32);
}

.verlof-admin-btn:disabled {
  opacity: 0.5;
  cursor: progress;
}

.verlof-admin-status {
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  white-space: nowrap;
}

.status--goedgekeurd {
  color: hsl(var(--c-success-h), var(--c-success-s), 75%);
  background: hsla(var(--c-success-h), var(--c-success-s), 45%, 0.2);
}

.status--afgewezen {
  color: hsl(var(--c-error-h), var(--c-error-s), 80%);
  background: hsla(var(--c-error-h), var(--c-error-s), 55%, 0.2);
}

@media (max-width: 40rem) {
  .verlof-admin-card {
    padding: var(--space-m);
  }

  .verlof-admin-item {
    flex-direction: column;
    align-items: stretch;
  }

  .verlof-admin-item__acties {
    width: 100%;
  }

  .verlof-admin-btn {
    flex: 1;
  }
}
</style>
