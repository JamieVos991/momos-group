export const useFirebaseAuth = () => {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$firebaseAuth
}
