'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: 'primary' | 'secondary' | 'green' | 'amber' | 'blue' | 'purple' | 'pink'
  prefix?: string
  suffix?: string
  trend?: { value: number; isPositive: boolean }
  delay?: number
}

const colorStyles = {
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    icon: 'bg-primary-500',
    text: 'text-primary-600 dark:text-primary-400',
  },
  secondary: {
    bg: 'bg-secondary-50 dark:bg-secondary-900/20',
    icon: 'bg-secondary-500',
    text: 'text-secondary-600 dark:text-secondary-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'bg-green-500',
    text: 'text-green-600 dark:text-green-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'bg-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    icon: 'bg-pink-500',
    text: 'text-pink-600 dark:text-pink-400',
  },
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color,
  prefix = '',
  suffix = '',
  trend,
  delay = 0,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const styles = colorStyles[color]

  const animateValue = useCallback(() => {
    const duration = 1500
    const steps = 60
    const stepValue = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += stepValue
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  useEffect(() => {
    const timeout = setTimeout(animateValue, delay * 100)
    return () => clearTimeout(timeout)
  }, [animateValue, delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1)' }}
      className={cn(
        'p-5 rounded-3xl shadow-soft transition-all duration-300',
        styles.bg
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <motion.p
            className={cn('text-3xl font-bold', styles.text)}
          >
            {prefix}
            {displayValue.toLocaleString('en-IN')}
            {suffix}
          </motion.p>
          {trend && (
            <p
              className={cn(
                'text-sm font-medium mt-1',
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center',
            styles.icon
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>
    </motion.div>
  )
}
