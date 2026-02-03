'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, Edit2, Trash2, Phone, Mail, MapPin, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useDataStore } from '@/store'
import { generateId } from '@/lib/utils'
import type { Student } from '@/types'

function formatDateForInput(date: string | Date | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

export default function StudentsPage() {
  const { students, classes, loading, error, fetchStudents, fetchClasses, addStudent, updateStudent, deleteStudent } = useDataStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  
  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [fetchStudents, fetchClasses])

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = selectedClass === 'all' || student.classId === selectedClass
    return matchesSearch && matchesClass
  })

  const handleAddStudent = () => {
    setEditingStudent(null)
    setIsModalOpen(true)
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setIsModalOpen(true)
  }

  const handleDeleteStudent = (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      deleteStudent(id)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const classId = formData.get('classId') as string
    const name = formData.get('name') as string
    const nameParts = name.split(' ')
    
    const studentData = {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || nameParts[0],
      dateOfBirth: formData.get('dateOfBirth') as string,
      gender: formData.get('gender') as 'male' | 'female',
      classId: classId,
      parentName: formData.get('parentName') as string,
      parentPhone: formData.get('parentPhone') as string,
      parentEmail: formData.get('parentEmail') as string || `${(formData.get('parentName') as string).toLowerCase().replace(' ', '.')}@email.com`,
      address: formData.get('address') as string,
      admissionDate: formData.get('admissionDate') as string || new Date().toISOString().split('T')[0],
      bloodGroup: formData.get('bloodGroup') as string,
      emergencyContact: formData.get('parentPhone') as string,
    }

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, studentData)
      } else {
        await addStudent(studentData)
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save student:', error)
    }
  }

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading students...</p>
        </div>
      </div>
    )
  }

  if (error && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
          <p className="text-red-500 font-bold">Error loading students</p>
          <p className="text-gray-500">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Students
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {students.length} total students
          </p>
        </div>
        <Button onClick={handleAddStudent}>
          <Plus className="w-5 h-5" />
          Add Student
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search students..."
            icon={<Search className="w-5 h-5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Button
            variant={selectedClass === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedClass('all')}
          >
            All
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="cursor-pointer" onClick={() => setSelectedStudent(student)}>
                <div className="flex items-start gap-4">
                  <Avatar src={student.photo} name={student.name} size="xl" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                      {student.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {student.className}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <Phone className="w-3 h-3" />
                      {student.parentPhone}
                    </div>
                  </div>
                  <Badge variant="success">{student.status}</Badge>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditStudent(student)
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteStudent(student.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No students found</p>
        </div>
      )}

      <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingStudent ? 'Edit Student' : 'Add New Student'}
          size="lg"
        >
          <form key={editingStudent?.id || 'new'} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              required
              defaultValue={editingStudent?.name}
              placeholder="Enter student name"
            />
            <Input
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                required
                defaultValue={formatDateForInput(editingStudent?.dateOfBirth)}
              />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Gender
              </label>
              <select
                name="gender"
                required
                defaultValue={editingStudent?.gender || 'male'}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Class
              </label>
              <select
                name="classId"
                required
                defaultValue={editingStudent?.classId || ''}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Parent Name"
              name="parentName"
              required
              defaultValue={editingStudent?.parentName}
              placeholder="Enter parent name"
            />
            <Input
              label="Parent Phone"
              name="parentPhone"
              type="tel"
              required
              defaultValue={editingStudent?.parentPhone}
              placeholder="Enter phone number"
            />
          </div>
          <Input
            label="Parent Email"
            name="parentEmail"
            type="email"
            defaultValue={editingStudent?.parentEmail}
            placeholder="Enter email (optional)"
          />
          <Input
            label="Address"
            name="address"
            required
            defaultValue={editingStudent?.address}
            placeholder="Enter address"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Blood Group"
              name="bloodGroup"
              defaultValue={editingStudent?.bloodGroup}
              placeholder="e.g., O+"
            />
            <Input
                label="Admission Date"
                name="admissionDate"
                type="date"
                defaultValue={formatDateForInput(editingStudent?.admissionDate) || new Date().toISOString().split('T')[0]}
              />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingStudent ? 'Update' : 'Add'} Student
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title="Student Details"
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar src={selectedStudent.photo} name={selectedStudent.name} size="xl" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedStudent.name}
                </h3>
                <p className="text-gray-500">{selectedStudent.className}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 mb-1">Parent Name</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.parentName}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.parentPhone}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.dateOfBirth}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 mb-1">Blood Group</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.bloodGroup || '-'}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
              <p className="text-sm text-gray-500 mb-1">Address</p>
              <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.address}</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedStudent(null)
                  handleEditStudent(selectedStudent)
                }}
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => window.open(`tel:${selectedStudent.parentPhone}`)}
              >
                <Phone className="w-4 h-4" />
                Call Parent
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
