import { ADMIN_EMAIL } from '~/utils/constants'

const DERTIG_DAGEN = 60 * 60 * 24 * 30

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

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const wachtwoord = String(body?.wachtwoord ?? '')
  const onthoudMij = body?.onthoudMij === 'on' || body?.onthoudMij === 'true'

  if (!email || !wachtwoord) {
    return sendRedirect(event, '/?error=auth/invalid-email', 302)
  }

  try {
    await $fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
      {
        method: 'POST',
        query: { key: config.public.firebaseApiKey },
        body: { email, password: wachtwoord, returnSecureToken: true },
      }
    )
  } catch (fout) {
    const foutcode = fout?.data?.error?.message
    return sendRedirect(event, `/?error=${mapFoutcode(foutcode)}`, 302)
  }

  await setUserSession(
    event,
    { user: { email } },
    onthoudMij ? { maxAge: DERTIG_DAGEN } : {}
  )

  return sendRedirect(
    event,
    email === ADMIN_EMAIL ? '/admin/diensten' : '/roosters',
    302
  )
})
