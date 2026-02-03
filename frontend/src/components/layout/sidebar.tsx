'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  IndianRupee,
  GraduationCap,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  X,
  ChevronRight,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, useAuthStore } from '@/store'
import { useRole } from '@/lib/useAuth'
import { Role } from '@/lib/rbac'

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
  color: string
  roles: Role[]
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'bg-primary-500', roles: ['admin', 'teacher', 'parent'] },
  { href: '/students', icon: Users, label: 'Students', color: 'bg-secondary-500', roles: ['admin', 'teacher', 'parent'] },
  { href: '/attendance', icon: CalendarCheck, label: 'Attendance', color: 'bg-green-500', roles: ['admin', 'teacher', 'parent'] },
  { href: '/fees', icon: IndianRupee, label: 'Fees', color: 'bg-amber-500', roles: ['admin', 'teacher', 'parent'] },
  { href: '/teachers', icon: GraduationCap, label: 'Teachers', color: 'bg-blue-500', roles: ['admin', 'teacher'] },
  { href: '/announcements', icon: Megaphone, label: 'Announcements', color: 'bg-purple-500', roles: ['admin', 'teacher', 'parent'] },
  { href: '/reports', icon: BarChart3, label: 'Reports', color: 'bg-pink-500', roles: ['admin', 'teacher'] },
  { href: '/settings', icon: Settings, label: 'Settings', color: 'bg-gray-500', roles: ['admin'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useAppStore()
  const { logout, school } = useAuthStore()
  const role = useRole()

  const filteredNavItems = navItems.filter((item) => {
    if (!role) return false
    return item.roles.includes(role)
  })

  const schoolName = school?.name || 'My School'

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

        <aside
          className={cn(
            'fixed left-0 top-0 h-screen w-72 bg-white dark:bg-gray-900 z-50 shadow-soft-lg transition-transform duration-300 ease-out overflow-hidden',
            'lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-100 lg:dark:border-gray-800',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0 p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center">
                    <span className="text-xl">🏫</span>
                  </div>
                  <div>
                    <h1 className="font-bold text-lg text-gray-900 dark:text-white font-display truncate max-w-[140px]">
                      {schoolName}
                    </h1>
                    <p className="text-xs text-gray-500">Management System</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {filteredNavItems.map((item, index) => {
                const isActive = pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200',
                        'hover:bg-gray-50 dark:hover:bg-gray-800',
                        isActive && 'bg-primary-50 dark:bg-primary-900/20'
                      )}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          isActive ? item.color : 'bg-gray-100 dark:bg-gray-800'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'w-5 h-5',
                            isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                          )}
                        />
                      </motion.div>
                      <span
                        className={cn(
                          'font-semibold',
                          isActive
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-600 dark:text-gray-400'
                        )}
                      >
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto"
                        >
                          <ChevronRight className="w-5 h-5 text-primary-500" />
                        </motion.div>
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </nav>

          <div className="flex-shrink-0 p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                logout()
                window.location.href = '/login'
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-semibold">Logout</span>
            </motion.button>
          </div>
        </div>
      </aside>
    </>
  )
}
