export const AUTH_ROLE_ROUTES = {
  superadmin: "/superadmin",
  admin: "/admin",
  president: "/president",
  secretaire: "/secretaire",
  tresorier: "/tresorier",
  censeur: "/censeur",
  membre: "/membre",
};

export function routeForRole(role) {
  return AUTH_ROLE_ROUTES[role] || "/";
}
