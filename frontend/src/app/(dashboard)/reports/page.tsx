'use client'

import { motion } from 'framer-motion'
import { Download, Users, CalendarCheck, IndianRupee, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useDataStore } from '@/store'
import { formatCurrency } from '@/lib/utils'

export default function ReportsPage() {
  const { students, attendance, fees, classes } = useDataStore()

  const studentsByClass = classes.map(cls => ({
    name: cls.name,
    count: students.filter(s => s.classId === cls.id).length,
  }))

  const today = new Date().toISOString().split('T')[0]
  const todayAttendance = attendance.filter(a => a.date === today)
  const presentToday = todayAttendance.filter(a => a.status === 'present').length
  const attendanceRate = students.length > 0 ? Math.round((presentToday / students.length) * 100) : 0

  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0)
  const collectedFees = fees.reduce((sum, f) => sum + f.paidAmount, 0)
  const collectionRate = totalFees > 0 ? Math.round((collectedFees / totalFees) * 100) : 0

  const feesByStatus = {
    paid: fees.filter(f => f.status === 'paid').length,
    partial: fees.filter(f => f.status === 'partial').length,
    due: fees.filter(f => f.status === 'due').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Reports
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Overview and analytics
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-5 h-5" />
          Export All
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-500" />
              Student Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentsByClass.map((cls, index) => (
                <motion.div
                  key={cls.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{cls.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{cls.count}</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(cls.count / students.length) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Students</span>
                <span className="font-bold text-gray-900 dark:text-white">{students.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-green-500" />
              Attendance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-gray-100 dark:text-gray-700"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '0 352' }}
                    animate={{ strokeDasharray: `${(attendanceRate / 100) * 352} 352` }}
                    transition={{ duration: 1 }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {attendanceRate}%
                  </span>
                </div>
              </div>
              <p className="text-gray-500 mt-2">Today&apos;s Attendance</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                <p className="text-xl font-bold text-green-600">{presentToday}</p>
                <p className="text-xs text-gray-500">Present</p>
              </div>
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                <p className="text-xl font-bold text-red-600">{students.length - presentToday}</p>
                <p className="text-xs text-gray-500">Absent</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xl font-bold text-gray-600 dark:text-gray-400">{students.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-amber-500" />
              Fee Collection Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalFees)}
                </p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(collectedFees)}
                </p>
                <p className="text-sm text-gray-500">Collected</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(totalFees - collectedFees)}
                </p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {collectionRate}%
                </p>
                <p className="text-sm text-gray-500">Collection Rate</p>
              </div>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${collectionRate}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-green-500 to-secondary-500 rounded-full"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-green-600">{feesByStatus.paid}</p>
                <p className="text-sm text-gray-500">Paid</p>
              </div>
              <div>
                <p className="text-xl font-bold text-amber-600">{feesByStatus.partial}</p>
                <p className="text-sm text-gray-500">Partial</p>
              </div>
              <div>
                <p className="text-xl font-bold text-red-600">{feesByStatus.due}</p>
                <p className="text-sm text-gray-500">Due</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
