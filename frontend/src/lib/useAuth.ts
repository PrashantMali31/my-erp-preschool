'use client'

import { useAuthStore } from '@/store'
import { Role, Resource, Action, hasPermission, canAccessRoute } from '@/lib/rbac'

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, login, logout, getRole, getPermissions } = useAuthStore()

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    role: getRole(),
    permissions: getPermissions(),
  }
}

export function usePermission(resource: Resource, action: Action) {
  const role = useAuthStore((state) => state.getRole())

  if (!role) {
    return {
      hasPermission: false,
      isLoading: false,
    }
  }

  return {
    hasPermission: hasPermission(role, resource, action),
    isLoading: false,
  }
}

export function useCanAccess(path: string) {
  const role = useAuthStore((state) => state.getRole())

  if (!role) {
    return false
  }

  return canAccessRoute(role, path)
}

export function useRole() {
  return useAuthStore((state) => state.getRole())
}

export function useIsAdmin() {
  const role = useRole()
  return role === 'admin'
}

export function useIsTeacher() {
  const role = useRole()
  return role === 'teacher'
}

export function useIsParent() {
  const role = useRole()
  return role === 'parent'
}
