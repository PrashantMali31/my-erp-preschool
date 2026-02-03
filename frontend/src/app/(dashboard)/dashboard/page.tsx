'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, CalendarCheck, IndianRupee, AlertCircle, Megaphone, TrendingUp, Clock, Loader2 } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useDataStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

const quickActions = [
  { label: 'Add Student', href: '/students?action=add', icon: Users, color: 'bg-secondary-500' },
  { label: 'Mark Attendance', href: '/attendance', icon: CalendarCheck, color: 'bg-green-500' },
  { label: 'Collect Fee', href: '/fees', icon: IndianRupee, color: 'bg-amber-500' },
  { label: 'Announcement', href: '/announcements?action=add', icon: Megaphone, color: 'bg-purple-500' },
]

export default function DashboardPage() {
  const { students, attendance, fees, announcements, loading, fetchDashboardData } = useDataStore()

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const today = new Date().toISOString().split('T')[0]
  const todayAttendance = attendance.filter(a => a.date === today)
  const presentToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length

  const totalFees = fees.reduce((sum, f) => sum + (f.amount || 0), 0)
  const collectedFees = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0)
  const pendingFees = totalFees - collectedFees

  const recentAnnouncements = announcements.slice(0, 3)
  const recentStudents = students.slice(0, 5)

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={students.length}
          icon={Users}
          color="primary"
          delay={0}
        />
        <StatCard
          title="Present Today"
          value={presentToday}
          icon={CalendarCheck}
          color="green"
          suffix={`/${students.length}`}
          delay={1}
        />
        <StatCard
          title="Fees Collected"
          value={collectedFees}
          icon={IndianRupee}
          color="secondary"
          prefix="₹"
          delay={2}
        />
        <StatCard
          title="Pending Fees"
          value={pendingFees}
          icon={AlertCircle}
          color="amber"
          prefix="₹"
          delay={3}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Link href={action.href}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-soft flex items-center gap-3 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                  {action.label}
                </span>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-500" />
              Recent Announcements
            </CardTitle>
            <Link href="/announcements">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAnnouncements.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No announcements yet</p>
            ) : (
              recentAnnouncements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {announcement.title}
                        </h4>
                        <Badge
                          variant={
                            announcement.type === 'event' ? 'info' :
                            announcement.type === 'holiday' ? 'warning' :
                            announcement.type === 'urgent' ? 'danger' : 'default'
                          }
                        >
                          {announcement.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {announcement.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {format(new Date(announcement.createdAt), 'dd MMM yyyy')}
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary-500" />
              Recent Students
            </CardTitle>
            <Link href="/students">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentStudents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No students yet</p>
            ) : (
              recentStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Avatar name={student.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {student.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {student.className} • {student.parentName}
                    </p>
                  </div>
                  <Badge variant="success">{student.className}</Badge>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            Fee Collection Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 rounded-2xl bg-green-50 dark:bg-green-900/20">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(collectedFees)}
              </p>
              <p className="text-sm text-gray-500">Collected</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(pendingFees)}
              </p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalFees)}
              </p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: totalFees > 0 ? `${(collectedFees / totalFees) * 100}%` : '0%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-green-500 to-secondary-500 rounded-full"
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            {totalFees > 0 ? Math.round((collectedFees / totalFees) * 100) : 0}% collected
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
