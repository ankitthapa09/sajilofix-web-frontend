export const API_ENDPOINTS = {
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
    requestPasswordReset: "/api/auth/request-password-reset",
    resetPassword: (token: string) => `/api/auth/reset-password/${token}`,
  },
  admin: {
    users: "/api/admin/users",
    authorities: "/api/admin/authorities",
    citizens: "/api/admin/citizens",
  },
  users: {
    me: "/api/users/me",
    meUpdate: "/api/users/me",
    mePhoto: "/api/users/me/photo",
  },
} as const;
