'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded-lg',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-2xl',
  }

  return (
    <motion.div
      className={cn('shimmer', variants[variant], className)}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-soft">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1">
          <Skeleton variant="text" className="w-3/4 mb-2" />
          <Skeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-soft flex items-center gap-4"
        >
          <Skeleton variant="circular" className="w-12 h-12" />
          <div className="flex-1">
            <Skeleton variant="text" className="w-1/2 mb-2" />
            <Skeleton variant="text" className="w-1/3 h-3" />
          </div>
          <Skeleton className="w-20 h-8 rounded-xl" />
        </motion.div>
      ))}
    </div>
  )
}
