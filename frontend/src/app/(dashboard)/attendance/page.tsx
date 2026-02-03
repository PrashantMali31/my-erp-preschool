'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, X, Clock, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useDataStore } from '@/store'
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'

export default function AttendancePage() {
  const { students, classes, attendance, fetchStudents, fetchClasses, fetchAttendance, markAttendance } = useDataStore()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [fetchStudents, fetchClasses])

  useEffect(() => {
    fetchAttendance(format(selectedDate, 'yyyy-MM-dd'))
  }, [selectedDate, fetchAttendance])

  const dateString = format(selectedDate, 'yyyy-MM-dd')

  const filteredStudents = students.filter(
    student => 
      (selectedClass === 'all' || student.classId === selectedClass) &&
      (searchQuery === '' || student.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getAttendanceStatus = (studentId: string) => {
    const record = attendance.find(
      a => a.studentId === studentId && a.date === dateString
    )
    return record?.status || null
  }

  const handleMarkAttendance = (studentId: string, classId: string, status: 'present' | 'absent') => {
    markAttendance(studentId, classId, dateString, status)
  }

  const presentCount = filteredStudents.filter(
    s => getAttendanceStatus(s.id) === 'present'
  ).length

  const absentCount = filteredStudents.filter(
    s => getAttendanceStatus(s.id) === 'absent'
  ).length

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Attendance
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {format(selectedDate, 'EEEE, d MMMM yyyy')}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-soft">
        <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 7))}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex gap-2 overflow-x-auto py-2">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, new Date())
            return (
              <motion.button
                key={day.toISOString()}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center p-3 rounded-2xl min-w-[60px] transition-colors ${
                  isSelected
                    ? 'bg-primary-500 text-white'
                    : isToday
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-xs font-medium opacity-70">
                  {format(day, 'EEE')}
                </span>
                <span className="text-lg font-bold">{format(day, 'd')}</span>
              </motion.button>
            )
          })}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedClass === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setSelectedClass('all')}
        >
          All Classes
        </Button>
        {classes.map(cls => (
          <Button
            key={cls.id}
            variant={selectedClass === cls.id ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedClass(cls.id)}
          >
            {cls.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{presentCount}</p>
            <p className="text-sm text-gray-500">Present</p>
          </div>
        </Card>
        <Card className="bg-red-50 dark:bg-red-900/20">
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{absentCount}</p>
            <p className="text-sm text-gray-500">Absent</p>
          </div>
        </Card>
        <Card className="bg-gray-50 dark:bg-gray-700/50">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
              {filteredStudents.length - presentCount - absentCount}
            </p>
            <p className="text-sm text-gray-500">Not Marked</p>
          </div>
        </Card>
      </div>

      <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <CardTitle>Mark Attendance</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardHeader>
        <CardContent className="space-y-3">
          {filteredStudents.map((student, index) => {
            const status = getAttendanceStatus(student.id)
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50"
              >
                <Avatar src={student.photo} name={student.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {student.name}
                  </h4>
                  <p className="text-sm text-gray-500">{student.className}</p>
                </div>
                <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleMarkAttendance(student.id, student.classId, 'present')}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        status === 'present'
                          ? 'bg-green-500 text-white'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200'
                      }`}
                    >
                      <Check className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleMarkAttendance(student.id, student.classId, 'absent')}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        status === 'absent'
                          ? 'bg-red-500 text-white'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200'
                      }`}
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                </div>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
