// 1. De browser stuurt het formulier op.
// In index.vue staat <form method="post" action="/api/login">. Zodra je op de
// knop klikt (met of zonder JavaScript), stuurt de browser email + wachtwoord +
// het vinkje "onthoud mij" naar dit adres. Dit bestand vangt dat verzoek op.
import { ADMIN_EMAIL } from '~/utils/constants'

const DERTIG_DAGEN = 60 * 60 * 24 * 30

// Vertaalt de foutcode van Firebase's Identity Toolkit REST-API naar de codes
function mapFoutcode(foutcode) {
  switch (foutcode) {
    case 'INVALID_LOGIN_CREDENTIALS':
    case 'EMAIL_NOT_FOUND':
    case 'INVALID_PASSWORD':
      return 'auth/invalid-credential'
    case 'INVALID_EMAIL':
      return 'auth/invalid-email'
    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
      return 'auth/too-many-requests'
    default:
      return 'auth/unknown'
  }
}

// 2. defineEventHandler is Nuxt's manier om te zeggen: "als er een verzoek
// binnenkomt op /api/login, voer deze functie uit." event bevat alles over dat
// binnenkomende verzoek (welke data is meegestuurd, welke browser, etc.).
export default defineEventHandler(async (event) => {
  // 3. Gegevens uitlezen.
  // readBody(event) pakt de data die de browser meestuurde (email, wachtwoord,
  // onthoudMij) en zet het om in een gewoon JavaScript-object. useRuntimeConfig
  // haalt de instellingen op uit .env — hier de Firebase API-sleutel.
  const configuratie = useRuntimeConfig(event)
  const formulierData = await readBody(event)

  // 4. Gegevens opschonen.
  // - email: spaties eraf, alles kleine letters, zodat "Jamie@X.nl" hetzelfde
  //   is als "jamie@x.nl"
  //  als het veld leeg/afwezig is, gebruik een lege string i.p.v. een crash
  // - onthoudMij: een HTML checkbox stuurt de string "on" mee als hij is
  //   aangevinkt (of helemaal niets als hij leeg is)
  const email = String(formulierData?.email ?? '').trim().toLowerCase()
  const wachtwoord = String(formulierData?.wachtwoord ?? '')
  const onthoudMij = formulierData?.onthoudMij === 'on' || formulierData?.onthoudMij === 'true'

  // 5. Basiscontrole: e-mail of wachtwoord leeg? Dan direct terug naar de
  // inlogpagina met een foutmelding in de link (?error=...), geen verdere
  // verwerking nodig.
  if (!email || !wachtwoord) {
    return sendRedirect(event, '/?error=auth/invalid-email', 302)
  }

  // 6. Het wachtwoord checken bij Firebase.
  // De server stuurt zelf een verzoek naar Firebase's eigen inlog-adres, met
  // email/wachtwoord erbij. Firebase checkt of dat klopt. Klopt het niet, dan
  // gooit $fetch een fout, en springt de code naar het catch-blok, dat de
  // foutcode vertaalt en je terugstuurt naar de inlogpagina met de juiste melding.
  try {
    await $fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
      {
        method: 'POST',
        query: { key: configuratie.public.firebaseApiKey },
        body: { email, password: wachtwoord, returnSecureToken: true },
      }
    )
  } catch (fout) {
    const foutcode = fout?.data?.error?.message
    return sendRedirect(event, `/?error=${mapFoutcode(foutcode)}`, 302)
  }

  // 7. Sessie aanmaken.
  // Klopt het wachtwoord? Dan maakt nuxt-auth-utils een versleutelde cookie aan
  // met daarin je email, die de browser vanaf nu meestuurt bij elk bezoek —
  // dit ís het "ingelogd zijn". DERTIG_DAGEN bepaalt hoe lang die cookie geldig
  // blijft als "onthoud mij" is aangevinkt.
  await setUserSession(
    event,
    { user: { email } },
    onthoudMij ? { maxAge: DERTIG_DAGEN } : {}
  )

  // 8. Doorsturen naar het juiste dashboard.
  // Een "302 redirect": de browser wordt automatisch doorgestuurd naar
  // /admin/diensten (admin) of /roosters (medewerker) — zonder dat er
  // JavaScript aan te pas hoefde te komen.
  return sendRedirect(
    event,
    email === ADMIN_EMAIL ? '/admin/diensten' : '/roosters',
    302
  )
})
