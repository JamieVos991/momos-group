<script setup>
defineProps({
  email: {
    type: String,
    required: true,
  },
});

defineEmits(["uitloggen"]);
</script>

<template>
  <section class="login-card" aria-labelledby="welcome-title">
    <header class="login-card__header">
      <h1 id="welcome-title" class="login-card__title">Je bent ingelogd</h1>
      <p class="login-card__subtitle">Ingelogd als {{ email }}</p>
    </header>

    <button class="submit-btn" type="button" @click="$emit('uitloggen')">
      <span>Uitloggen</span>
    </button>
  </section>
</template>
