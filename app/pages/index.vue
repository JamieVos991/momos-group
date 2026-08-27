<script setup>
// Het formulier hieronder post naar server/api/login.post.js (echte HTML-post),
// dus inloggen werkt ook zonder JavaScript. De foutmelding komt niet uit een
// catch-block maar uit de ?error=-query die de server na een mislukte poging
// teruggeeft.
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";

useHead({
  title: "Inloggen",
});

const route = useRoute();
const auth = useFirebaseAuth();

// Vertaalt de foutcode uit de ?error=-query naar een leesbare Nederlandse melding
function vertaalAuthFout(foutcode) {
  switch (foutcode) {
    case "auth/invalid-credential":
      return 'Onjuiste inloggegevens, controleer je e-mailadres en wachtwoord. <a href="/wachtwoord-vergeten">Klik hier als je je wachtwoord bent vergeten.</a>';
    case "auth/invalid-email":
      return "Vul een geldig e-mailadres in.";
    case "auth/too-many-requests":
      return "Te veel pogingen, probeer het later opnieuw.";
    default:
      return 'Er ging iets mis bij het inloggen. Probeer het opnieuw, of <a href="mailto:info@restaurantmomos.nl">neem contact met ons op</a> als dit blijft gebeuren.';
  }
}

// Werkt al tijdens server-rendering: de query is bekend voordat de pagina
// naar de browser gaat, dus de foutmelding staat er al zonder JavaScript.
const foutmelding = computed(() =>
  route.query.error ? vertaalAuthFout(route.query.error) : ""
);

const emailVeldRef = ref(null);

// Zet de focus op het e-mailveld als er een foutmelding is (werkt alleen met JS, is puur een verbetering)
onMounted(() => {
  if (foutmelding.value) emailVeldRef.value?.focus();
});

// JS-verbetering bovenop de echte formulier-post hierboven: server/api/login.post.js
// logt je in via onze eigen sessie-cookie, maar logt de Firebase-client in de
// browser zelf niet in. Pagina's die nog rechtstreeks Firestore uitlezen
// (medewerkers, functies, evenementen, de dienst-modal) hebben die client-login
// wél nodig. Dus: als er JS is, loggen we hier ook nog even in bij de
// client-SDK, en laten we daarna de normale, native formulier-post gewoon
// doorgaan naar de server (geen fetch, geen eigen redirect-logica).
async function ookClientInloggen(evt) {
  evt.preventDefault();
  const formulier = evt.target;
  const email = formulier.email.value.trim();
  const wachtwoord = formulier.wachtwoord.value;
  const onthoudMij = formulier.onthoudMij.checked;

  try {
    await setPersistence(
      auth,
      onthoudMij ? browserLocalPersistence : browserSessionPersistence
    );
    await signInWithEmailAndPassword(auth, email, wachtwoord);
  } catch {
    // Bewust genegeerd: de server hierna doet de echte verificatie en
    // toont de juiste foutmelding als het misgaat.
  }

  formulier.submit(); // gewone, native form-submission naar de server
}
</script>

<template>
  <main class="login-screen">
    <section class="login-card" aria-labelledby="login-title">
      <header class="login-card__header">
        <h1 id="login-title" class="login-card__title">Welkom terug</h1>
        <p class="login-card__subtitle">
          Log in om verder te gaan naar de roosters
        </p>
      </header>

      <p v-if="foutmelding" role="alert" v-html="foutmelding"></p>

      <!-- Echte formulier-post: de name-attributen op de velden hieronder zijn
           wat de browser meestuurt, met of zonder JS. @submit is puur een
           JS-verbetering (zie ookClientInloggen hierboven), geen vereiste. -->
      <form method="post" action="/api/login" @submit="ookClientInloggen">
        <label>
          <span>E-mailadress</span>
          <span>
            <input
              ref="emailVeldRef"
              name="email"
              type="email"
              autocomplete="email"
              placeholder="Jouw@naam.nl"
              :aria-invalid="!!foutmelding"
              required
            />
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle
                cx="12"
                cy="8"
                r="3.5"
                stroke="currentColor"
                stroke-width="1.6"
              />
              <path
                d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </span>
        </label>

        <label>
          <span>Wachtwoord</span>
          <span>
            <input
              name="wachtwoord"
              type="password"
              autocomplete="current-password"
              placeholder="••••••"
              :aria-invalid="!!foutmelding"
              required
            />
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="3"
                y="6"
                width="18"
                height="12"
                rx="2"
                stroke="currentColor"
                stroke-width="1.6"
              />
              <path d="M3 10h18" stroke="currentColor" stroke-width="1.6" />
              <path
                d="M6.5 14h3"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </span>
        </label>

        <label class="onthoudmij">
          <input name="onthoudMij" type="checkbox" />
          <span>Onthoud mij</span>
        </label>

        <button class="submit-btn" type="submit">
          <span>Inloggen</span>
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: var(--space-m);

  label {
    display: block;

    span:first-child {
      display: block;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--c-primary);
      margin-bottom: var(--space-xs);
    }

    span:last-child {
      display: block;
      position: relative;

      input {
        width: 100%;
        font: inherit;
        padding: 0.65rem 2.5rem 0.65rem 0.9rem;
        border: 1px solid hsl(231, 15%, 80%);
        border-radius: var(--radius);
        background: #fff;
        color: var(--c-dark);

        &::placeholder {
          color: hsl(231, 10%, 65%);
        }

        &:focus {
          outline: none;
          border-color: var(--c-primary);
        }
      }

      svg {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        width: 1.1rem;
        height: 1.1rem;
        color: hsl(231, 15%, 55%);
        pointer-events: none;
      }
    }

    &:has(input[aria-invalid="true"]) {
      span:first-child {
        color: hsl(var(--c-error-h), var(--c-error-s), 40%);
      }

      input {
        border-color: hsl(var(--c-error-h), var(--c-error-s), 60%);
        background: hsl(var(--c-error-h), var(--c-error-s), 98%);
      }

      svg {
        color: hsl(var(--c-error-h), var(--c-error-s), 55%);
      }
    }
  }
}

.onthoudmij {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.8rem;
  color: var(--c-dark);
  cursor: pointer;

  input {
    accent-color: var(--c-primary);
  }
}
</style>
