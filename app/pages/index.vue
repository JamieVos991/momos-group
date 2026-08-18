<script setup>
import {
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

useHead({
  title: "Inloggen",
});

const auth = useFirebaseAuth();

const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");
const currentUser = ref(null);

const emailInputRef = ref(null);
const passwordInputRef = ref(null);

// Houdt currentUser in sync met Firebase en stuurt ingelogde gebruikers door naar /roosters
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    if (user) navigateTo("/roosters");
  });
});

// Vertaalt Firebase auth foutcodes naar een leesbare Nederlandse foutmelding
function mapAuthError(code) {
  switch (code) {
    case "auth/user-not-found":
      return "Geen account gevonden met dit e-mailadres.";
    case "auth/wrong-password":
      return "Onjuist wachtwoord, probeer het opnieuw.";
    case "auth/invalid-credential":
      return "Onjuiste inloggegevens, controleer je e-mailadres en wachtwoord.";
    case "auth/invalid-email":
      return "Vul een geldig e-mailadres in.";
    case "auth/too-many-requests":
      return "Te veel pogingen, probeer het later opnieuw.";
    case "auth/network-request-failed":
      return "Geen verbinding, controleer je internetverbinding.";
    default:
      return "Er ging iets mis bij het inloggen. Probeer het opnieuw.";
  }
}

// Verwerkt het login formulier: zet persistence (onthoud mij) en logt in met e-mail/wachtwoord
async function handleSubmit() {
  if (isLoading.value) return;

  errorMessage.value = "";
  isLoading.value = true;

  try {
    await setPersistence(
      auth,
      rememberMe.value ? browserLocalPersistence : browserSessionPersistence
    );
    await signInWithEmailAndPassword(auth, email.value.trim(), password.value);
  } catch (error) {
    errorMessage.value = mapAuthError(error.code);
    emailInputRef.value?.focus();
  } finally {
    isLoading.value = false;
  }
}

// Logt de huidige gebruiker uit bij Firebase
async function handleSignOut() {
  await signOut(auth);
}
</script>

<template>
  <main class="login-screen">
    <section
      v-if="currentUser"
      class="login-card"
      aria-labelledby="welcome-title"
    >
      <header class="login-card__header">
        <h1 id="welcome-title" class="login-card__title">Je bent ingelogd</h1>
        <p class="login-card__subtitle">Ingelogd als {{ currentUser.email }}</p>
      </header>

      <button class="submit-btn" type="button" @click="handleSignOut">
        <span>Uitloggen</span>
      </button>
    </section>

    <section v-else class="login-card" aria-labelledby="login-title">
      <header class="login-card__header">
        <h1 id="login-title" class="login-card__title">Welkom terug</h1>
        <p class="login-card__subtitle">
          Log in om verder te gaan naar de roosters
        </p>
      </header>

      <p v-if="errorMessage" class="login-card__error" role="alert">
        {{ errorMessage }}
      </p>

      <form class="login-form" novalidate @submit.prevent="handleSubmit">
        <label class="field" :class="{ 'field--error': errorMessage }">
          <span class="field__label">E-mailadress</span>
          <span class="field__control">
            <input
              ref="emailInputRef"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="Jouw@naam.nl"
              required
            />
            <svg
              class="field__icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
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

        <label class="field" :class="{ 'field--error': errorMessage }">
          <span class="field__label">Wachtwoord</span>
          <span class="field__control">
            <input
              ref="passwordInputRef"
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••"
              required
            />
            <svg
              class="field__icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
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

        <label class="remember">
          <input v-model="rememberMe" type="checkbox" />
          <span>Onthoud mij</span>
        </label>

        <button class="submit-btn" type="submit" :disabled="isLoading">
          <svg
            v-if="isLoading"
            class="submit-btn__spinner"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              stroke-width="3"
              fill="none"
              opacity="0.3"
            />
            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="currentColor"
              stroke-width="3"
              fill="none"
              stroke-linecap="round"
            />
          </svg>
          <span>Inloggen</span>
        </button>
      </form>
    </section>
  </main>
</template>
