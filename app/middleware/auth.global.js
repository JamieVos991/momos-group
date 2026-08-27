const OPENBARE_PADEN = ["/", "/wachtwoord-vergeten"];

// Centrale toegangscontrole: draait isomorf, dus ook als een echte server-redirect
// bij een kale paginalaad zonder JavaScript.
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession();
  const isAdmin = user.value?.email === ADMIN_EMAIL;

  if (to.path === "/") {
    if (loggedIn.value) {
      return navigateTo(isAdmin ? "/admin/diensten" : "/roosters");
    }
    return;
  }

  if (OPENBARE_PADEN.includes(to.path)) return;

  if (to.path.startsWith("/admin")) {
    if (!loggedIn.value) return navigateTo("/");
    if (!isAdmin) return navigateTo("/roosters");
    return;
  }

  if (!loggedIn.value) return navigateTo("/");
  if (isAdmin) return navigateTo("/admin/diensten");
});
