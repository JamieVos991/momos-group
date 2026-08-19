<script setup>
import { onAuthStateChanged, signOut } from 'firebase/auth'

useHead({
  title: 'Admin',
})

const auth = useFirebaseAuth()
const currentUser = ref(null)

// Alleen de admin mag deze pagina zien; anderen worden teruggestuurd
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    if (!user) navigateTo('/')
    else if (user.email !== ADMIN_EMAIL) navigateTo('/roosters')
  })
})

async function handleSignOut() {
  await signOut(auth)
}
</script>

<template>
  <main class="login-screen">
    <section v-if="currentUser" class="login-card" aria-labelledby="admin-title">
      <header class="login-card__header">
        <h1 id="admin-title" class="login-card__title">Admin dashboard</h1>
        <p class="login-card__subtitle">Ingelogd als {{ currentUser.email }}</p>
      </header>

      <button class="submit-btn" type="button" @click="handleSignOut">
        <span>Uitloggen</span>
      </button>
    </section>
  </main>
</template>
