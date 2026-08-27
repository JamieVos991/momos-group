// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: { lang: 'nl' }
    }
  },
  modules: ['@pinia/nuxt', 'nuxt-auth-utils'],
  css: ['~/assets/styles/stylesheet.css'],
  runtimeConfig: {
    firebaseClientEmail: '',
    firebasePrivateKey: '',
    public: {
      firebaseApiKey: '',
      firebaseAuthDomain: '',
      firebaseProjectId: '',
      firebaseStorageBucket: '',
      firebaseMessagingSenderId: '',
      firebaseAppId: '',
      firebaseMeasurementId: ''
    }
  }
})
