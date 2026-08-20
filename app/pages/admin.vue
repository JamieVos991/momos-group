<script setup>
import { onAuthStateChanged, signOut } from 'firebase/auth'

useHead({
  title: 'Admin',
})

const auth = useFirebaseAuth()
const huidigeGebruiker = ref(null)

// Alleen de admin mag deze pagina zien; anderen worden teruggestuurd
onMounted(() => {
  onAuthStateChanged(auth, (gebruiker) => {
    huidigeGebruiker.value = gebruiker
    if (!gebruiker) navigateTo('/')
    else if (gebruiker.email !== ADMIN_EMAIL) navigateTo('/roosters')
  })
})

async function uitloggen() {
  await signOut(auth)
}
</script>

<template>
  <main class="login-screen">
    <section v-if="huidigeGebruiker" class="login-card" aria-labelledby="admin-title">
      <header class="login-card__header">
        <h1 id="admin-title" class="login-card__title">Admin dashboard</h1>
        <p class="login-card__subtitle">Ingelogd als {{ huidigeGebruiker.email }}</p>
      </header>

      <button class="submit-btn" type="button" @click="uitloggen">
        <span>Uitloggen</span>
      </button>
    </section>
  </main>
</template>
