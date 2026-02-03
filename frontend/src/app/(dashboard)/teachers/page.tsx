'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Phone, Mail, GraduationCap, IndianRupee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useDataStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import type { Teacher } from '@/types'

function formatDateForInput(date: string | Date | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

export default function TeachersPage() {
  const { teachers, classes, fetchTeachers, fetchClasses, addTeacher, updateTeacher, deleteTeacher } = useDataStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])

  useEffect(() => {
    fetchTeachers()
    fetchClasses()
  }, [fetchTeachers, fetchClasses])

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddTeacher = () => {
    setEditingTeacher(null)
    setSelectedClasses([])
    setIsModalOpen(true)
  }

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    const classIds = Array.isArray(teacher.assignedClasses)
      ? teacher.assignedClasses.map((c: unknown) => 
          typeof c === 'object' && c !== null ? String((c as Record<string, unknown>)._id) : String(c)
        )
      : []
    setSelectedClasses(classIds)
    setIsModalOpen(true)
  }

  const handleClassToggle = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    )
  }

  const handleDeleteTeacher = (id: string) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      deleteTeacher(id)
    }
  }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      
      const firstName = formData.get('firstName') as string
      const lastName = formData.get('lastName') as string
      
      const teacherData = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        dateOfBirth: formData.get('dateOfBirth') as string,
        gender: formData.get('gender') as string,
        qualification: formData.get('qualification') as string,
        specialization: formData.get('specialization') as string,
        assignedClasses: selectedClasses,
        joinDate: formData.get('joinDate') as string || new Date().toISOString().split('T')[0],
        salary: Number(formData.get('salary')),
        address: formData.get('address') as string,
        status: 'active',
      }

      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, teacherData)
      } else {
        await addTeacher(teacherData as unknown as Teacher)
      }
      setIsModalOpen(false)
    }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Teachers
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {teachers.length} teachers
          </p>
        </div>
        <Button onClick={handleAddTeacher}>
          <Plus className="w-5 h-5" />
          Add Teacher
        </Button>
      </div>

      <div className="flex-1">
        <Input
          placeholder="Search teachers..."
          icon={<Search className="w-5 h-5" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredTeachers.map((teacher, index) => (
            <motion.div
              key={teacher.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="flex items-start gap-4">
                  <Avatar src={teacher.photo} name={teacher.name} size="xl" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                      {teacher.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {teacher.qualification}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <Phone className="w-3 h-3" />
                      {teacher.phone}
                    </div>
                  </div>
                  <Badge variant="success">{teacher.status}</Badge>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Classes: {teacher.assignedClasses.map(c => 
                        classes.find(cls => cls.id === c)?.name || c
                      ).join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <IndianRupee className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Salary: {formatCurrency(teacher.salary)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditTeacher(teacher)}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDeleteTeacher(teacher.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
          size="lg"
        >
          <form key={editingTeacher?.id || 'new'} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                required
                defaultValue={editingTeacher?.firstName || editingTeacher?.name?.split(' ')[0]}
                placeholder="Enter first name"
              />
              <Input
                label="Last Name"
                name="lastName"
                required
                defaultValue={editingTeacher?.lastName || editingTeacher?.name?.split(' ').slice(1).join(' ')}
                placeholder="Enter last name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone"
                name="phone"
                type="tel"
                required
                defaultValue={editingTeacher?.phone}
                placeholder="Enter phone number"
              />
              <Input
                label="Email"
                name="email"
                type="email"
                required
                defaultValue={editingTeacher?.email}
                placeholder="Enter email"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  required
                  defaultValue={formatDateForInput(editingTeacher?.dateOfBirth)}
                />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                <select
                  name="gender"
                  required
                  defaultValue={editingTeacher?.gender || ''}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Qualification"
                name="qualification"
                required
                defaultValue={editingTeacher?.qualification}
                placeholder="e.g., B.Ed, M.A."
              />
              <Input
                label="Specialization"
                name="specialization"
                required
                defaultValue={editingTeacher?.specialization}
                placeholder="e.g., Mathematics, English"
              />
            </div>
            <Input
              label="Address"
              name="address"
              required
              defaultValue={editingTeacher?.address}
              placeholder="Enter full address"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Classes</label>
              <div className="flex flex-wrap gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 max-h-32 overflow-y-auto">
                {classes.length === 0 ? (
                  <span className="text-sm text-gray-500">No classes available. Please create classes first.</span>
                ) : (
                  classes.map((cls) => (
                    <label
                      key={cls.id}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        selectedClasses.includes(cls.id)
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedClasses.includes(cls.id)}
                        onChange={() => handleClassToggle(cls.id)}
                      />
                      <span className="text-sm">{cls.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Monthly Salary"
                name="salary"
                type="number"
                required
                defaultValue={editingTeacher?.salary}
                placeholder="Enter salary"
              />
              <Input
                  label="Join Date"
                  name="joinDate"
                  type="date"
                  defaultValue={formatDateForInput(editingTeacher?.joinDate) || new Date().toISOString().split('T')[0]}
                />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingTeacher ? 'Update' : 'Add'} Teacher
              </Button>
            </div>
          </form>
        </Modal>
    </div>
  )
}
