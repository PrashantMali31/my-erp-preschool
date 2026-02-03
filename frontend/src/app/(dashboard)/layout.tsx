'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuthStore } from '@/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login')
    }
  }, [mounted, isAuthenticated, router])

  const showLoading = !mounted
  const showContent = mounted && isAuthenticated

  return (
    <AnimatePresence mode="wait">
      {showLoading && (
        <div key="loading" className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500"
          />
        </div>
      )}
      {showContent && (
        <div key="dashboard" className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Sidebar />
          <div className="flex flex-col min-h-screen lg:ml-72">
            <Header />
            <main className="flex-1 p-4 lg:p-6 overflow-auto">
              <ErrorBoundary>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </ErrorBoundary>
            </main>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
