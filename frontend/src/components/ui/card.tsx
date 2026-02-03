'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pastel' | 'gradient'
  pastelColor?: 'pink' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'cyan'
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', pastelColor, hover = true, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-gray-800',
      pastel: pastelColor ? `bg-pastel-${pastelColor}` : 'bg-pastel-blue',
      gradient: 'gradient-warm dark:gradient-cool',
    }

    const pastelStyles: Record<string, string> = {
      pink: 'bg-pastel-pink',
      blue: 'bg-pastel-blue',
      green: 'bg-pastel-green',
      yellow: 'bg-pastel-yellow',
      purple: 'bg-pastel-purple',
      orange: 'bg-pastel-orange',
      cyan: 'bg-pastel-cyan',
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={hover ? { y: -4, boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1)' } : undefined}
        className={cn(
          'rounded-3xl p-6 shadow-soft transition-all duration-300',
          variant === 'pastel' && pastelColor ? pastelStyles[pastelColor] : variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-bold text-gray-900 dark:text-white font-display', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}
