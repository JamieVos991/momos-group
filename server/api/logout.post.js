// Verwerkt het uitlog-formulier in de layouts. Werkt zonder JS: de browser post
// hierheen en volgt de redirect terug naar de inlogpagina.
export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  return sendRedirect(event, '/', 302)
})
