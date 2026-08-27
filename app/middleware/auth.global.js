// Centrale toegangscontrole voor de hele app, draait op elke navigatie.
// "Globaal" betekent: automatisch actief op elke pagina, ook nieuwe, zonder dat
// je 'm zelf hoeft toe te voegen. Draait isomorf (zowel server- als client-side),
// dus bij een kale paginalaad zonder JavaScript is dit een echte server-redirect,
// en bij navigatie met JavaScript een client-side redirect.
const OPENBARE_PADEN = ["/", "/wachtwoord-vergeten"];

export default defineNuxtRouteMiddleware((naar) => {
  const { loggedIn: ingelogd, user: gebruiker } = useUserSession();
  const isAdmin = gebruiker.value?.email === ADMIN_EMAIL;

  // Inlogpagina: al ingelogd? Dan meteen doorsturen naar het juiste dashboard.
  if (naar.path === "/") {
    if (ingelogd.value) {
      return navigateTo(isAdmin ? "/admin/diensten" : "/roosters");
    }
    return;
  }

  // Wachtwoord-vergeten mag altijd bezocht worden, ingelogd of niet.
  if (OPENBARE_PADEN.includes(naar.path)) return;

  // Beheerpagina's: alleen toegankelijk voor de ingelogde admin.
  if (naar.path.startsWith("/admin")) {
    if (!ingelogd.value) return navigateTo("/");
    if (!isAdmin) return navigateTo("/roosters");
    return;
  }

  // Overige pagina's (medewerker-rooster/verlof): sessie vereist, en de admin
  // hoort daar niet te zitten (die heeft zijn eigen dashboard).
  if (!ingelogd.value) return navigateTo("/");
  if (isAdmin) return navigateTo("/admin/diensten");
});
