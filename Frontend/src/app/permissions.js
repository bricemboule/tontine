export const ROLE_HOME_PATHS = {
  superadmin: "/superadmin/dashboard",
  admin: "/admin",
  president: "/president",
  secretaire: "/secretaire",
  tresorier: "/tresorier",
  censeur: "/censeur",
  membre: "/membre",
};

export function homePathForRole(role) {
  return ROLE_HOME_PATHS[role] || "/login";
}

export function canAccessRoleRoute(user, roles) {
  if (!user) return false;
  if (!roles || roles.length === 0) return true;
  return roles.includes(user.role);
}
