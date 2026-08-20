<script setup>
import { onAuthStateChanged, signOut } from 'firebase/auth'

useHead({
  title: 'Roosters',
})

const auth = useFirebaseAuth()
const huidigeGebruiker = ref(null)

onMounted(() => {
  onAuthStateChanged(auth, (gebruiker) => {
    huidigeGebruiker.value = gebruiker
    if (!gebruiker) navigateTo('/')
    else if (gebruiker.email === ADMIN_EMAIL) navigateTo('/admin/diensten')
  })
})

async function uitloggen() {
  await signOut(auth)
}
</script>

<template>
  <main class="login-screen">
    <section v-if="huidigeGebruiker" class="login-card" aria-labelledby="roosters-title">
      <header class="login-card__header">
        <h1 id="roosters-title" class="login-card__title">Roosters</h1>
        <p class="login-card__subtitle">Ingelogd als {{ huidigeGebruiker.email }}</p>
      </header>

      <button class="submit-btn" type="button" @click="uitloggen">
        <span>Uitloggen</span>
      </button>
    </section>
  </main>
</template>
