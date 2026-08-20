<script setup>
useHead({
  title: "Wachtwoord vergeten",
});

const email = ref("");
</script>

<template>
  <main class="login-screen">
    <section class="login-card" aria-labelledby="reset-title">
      <header class="login-card__header">
        <h1 id="reset-title" class="login-card__title">Wachtwoord vergeten</h1>
        <p class="login-card__subtitle">
          Vul je e-mailadres in, dan sturen we je een link om een nieuw
          wachtwoord in te stellen.
        </p>
      </header>

      <form novalidate @submit.prevent>
        <label>
          <span>E-mailadress</span>
          <span>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="Jouw@naam.nl"
              required
            />
          </span>
        </label>

        <button class="submit-btn" type="submit">
          <span>Verstuur reset link</span>
        </button>
      </form>

      <NuxtLink to="/" class="terug-link">Terug naar inloggen</NuxtLink>
    </section>
  </main>
</template>

<style scoped>
.login-card__subtitle {
  margin-bottom: var(--space-m);
}

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
        padding: 0.65rem 0.9rem;
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
    }
  }
}

.terug-link {
  display: inline-block;
  margin-top: var(--space-m);
  font-size: 0.8rem;
  color: var(--c-primary);
  text-decoration: underline;
}
</style>
