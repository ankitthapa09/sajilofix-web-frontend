export const API_ENDPOINTS = {
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
  },
  admin: {
    users: "/api/admin/users",
    authorities: "/api/admin/authorities",
  },
  users: {
    me: "/api/users/me",
    mePhoto: "/api/users/me/photo",
  },
} as const;
