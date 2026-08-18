<script setup>
import { onAuthStateChanged, signOut } from 'firebase/auth'

useHead({
  title: 'Roosters',
})

const auth = useFirebaseAuth()
const currentUser = ref(null)

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    if (!user) navigateTo('/')
  })
})

async function handleSignOut() {
  await signOut(auth)
}
</script>

<template>
  <main class="login-screen">
    <section v-if="currentUser" class="login-card" aria-labelledby="roosters-title">
      <header class="login-card__header">
        <h1 id="roosters-title" class="login-card__title">Roosters</h1>
        <p class="login-card__subtitle">Ingelogd als {{ currentUser.email }}</p>
      </header>

      <button class="submit-btn" type="button" @click="handleSignOut">
        <span>Uitloggen</span>
      </button>
    </section>
  </main>
</template>
