'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldX, Lock, ArrowLeft } from 'lucide-react'
import { Role, Resource, Action } from '@/lib/rbac'
import { useRole, usePermission, useCanAccess } from '@/lib/useAuth'
import { useAuthStore } from '@/store'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles?: Role[]
  redirectTo?: string
  showAccessDenied?: boolean
}

export function RoleGuard({
  children,
  allowedRoles,
  redirectTo = '/dashboard',
  showAccessDenied = true,
}: RoleGuardProps) {
  const router = useRouter()
  const role = useRole()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      router.push('/login')
    }
    return <LoadingSkeleton />
  }

  if (!role) {
    return <LoadingSkeleton />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (!showAccessDenied) {
      router.push(redirectTo)
      return <LoadingSkeleton />
    }
    return <AccessDenied onGoBack={() => router.push(redirectTo)} />
  }

  return <>{children}</>
}

interface PermissionGuardProps {
  children: ReactNode
  resource: Resource
  action: Action
  fallback?: ReactNode
  showAccessDenied?: boolean
}

export function PermissionGuard({
  children,
  resource,
  action,
  fallback = null,
  showAccessDenied = false,
}: PermissionGuardProps) {
  const { hasPermission, isLoading } = usePermission(resource, action)

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!hasPermission) {
    if (showAccessDenied) {
      return <AccessDeniedInline />
    }
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface RouteGuardProps {
  children: ReactNode
  path: string
  redirectTo?: string
}

export function RouteGuard({ children, path, redirectTo = '/dashboard' }: RouteGuardProps) {
  const router = useRouter()
  const canAccess = useCanAccess(path)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      router.push('/login')
    }
    return <LoadingSkeleton />
  }

  if (!canAccess) {
    return <AccessDenied onGoBack={() => router.push(redirectTo)} />
  }

  return <>{children}</>
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
        <p className="text-gray-500 font-medium">Verifying access...</p>
      </motion.div>
    </div>
  )
}

interface AccessDeniedProps {
  onGoBack?: () => void
}

function AccessDenied({ onGoBack }: AccessDeniedProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          <motion.div
            initial={{ backgroundPosition: '0% 50%' }}
            animate={{ backgroundPosition: '100% 50%' }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
            className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-[length:200%_100%]"
          />

          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <ShieldX className="w-10 h-10 text-red-500" />
              </motion.div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
            >
              Access Denied
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 dark:text-gray-400 mb-6"
            >
              You don&apos;t have permission to access this page. Please contact your administrator if you
              believe this is an error.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl mb-6"
            >
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-amber-700 dark:text-amber-300">
                This area is restricted to authorized users only
              </span>
            </motion.div>

            {onGoBack && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGoBack}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back to Dashboard
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function AccessDeniedInline() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Lock className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h4 className="font-semibold text-red-700 dark:text-red-300">Permission Required</h4>
          <p className="text-sm text-red-600 dark:text-red-400">
            You don&apos;t have permission to perform this action.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export { AccessDenied, AccessDeniedInline, LoadingSkeleton }
