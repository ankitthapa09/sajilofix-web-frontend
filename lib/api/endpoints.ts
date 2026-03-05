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
  issues: {
    list: "/api/issues",
    create: "/api/issues",
    priority: "/api/issues/priority",
    reverseGeocode: "/api/issues/reverse-geocode",
    get: (id: string) => `/api/issues/${id}`,
    delete: (id: string) => `/api/issues/${id}`,
    updateStatus: (id: string) => `/api/issues/${id}/status`,
  },
  notifications: {
    list: "/api/notifications",
    unreadCount: "/api/notifications/unread-count",
    markRead: (id: string) => `/api/notifications/${id}/read`,
    markAllRead: "/api/notifications/read-all",
  },
} as const;
