export const useFirestore = () => {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$firestore
}
