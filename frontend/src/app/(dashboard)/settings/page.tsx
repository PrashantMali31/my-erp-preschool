'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { School, Palette, Bell, Users, Save, Sun, Moon, Monitor, Plus, X, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore, useDataStore } from '@/store'
import { ClassSection } from '@/types'

export default function SettingsPage() {
  const { theme, setTheme } = useAppStore()
  const { classes, fetchClasses, addClass, updateClass, deleteClass } = useDataStore()
  const [isSaving, setIsSaving] = useState(false)
  const [showAddClassModal, setShowAddClassModal] = useState(false)
  const [showEditClassModal, setShowEditClassModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null)
  const [newClass, setNewClass] = useState({ name: '', section: '', capacity: '' })
  const [editClass, setEditClass] = useState({ name: '', section: '', capacity: '' })
  const [isAddingClass, setIsAddingClass] = useState(false)
  const [isEditingClass, setIsEditingClass] = useState(false)
  const [isDeletingClass, setIsDeletingClass] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleAddClass = async () => {
    if (!newClass.name || !newClass.section || !newClass.capacity) {
      setError('All fields are required')
      return
    }
    setIsAddingClass(true)
    setError('')
    try {
      await addClass({
        name: newClass.name,
        section: newClass.section,
        capacity: parseInt(newClass.capacity),
      })
      setShowAddClassModal(false)
      setNewClass({ name: '', section: '', capacity: '' })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsAddingClass(false)
    }
  }

  const handleEditClick = (cls: ClassSection) => {
    setSelectedClass(cls)
    setEditClass({ name: cls.name, section: cls.section || '', capacity: String(cls.capacity) })
    setError('')
    setShowEditClassModal(true)
  }

  const handleUpdateClass = async () => {
    if (!editClass.name || !editClass.section || !editClass.capacity) {
      setError('All fields are required')
      return
    }
    if (!selectedClass) return
    setIsEditingClass(true)
    setError('')
    try {
      await updateClass(selectedClass.id, {
        name: editClass.name,
        section: editClass.section,
        capacity: parseInt(editClass.capacity),
      })
      setShowEditClassModal(false)
      setSelectedClass(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsEditingClass(false)
    }
  }

  const handleDeleteClick = (cls: ClassSection) => {
    setSelectedClass(cls)
    setShowDeleteConfirm(true)
  }

  const handleDeleteClass = async () => {
    if (!selectedClass) return
    setIsDeletingClass(true)
    try {
      await deleteClass(selectedClass.id)
      setShowDeleteConfirm(false)
      setSelectedClass(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsDeletingClass(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your school settings
          </p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving}>
          <Save className="w-5 h-5" />
          Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5 text-primary-500" />
              School Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="School Name"
              defaultValue="Little Stars Pre-School"
              placeholder="Enter school name"
            />
            <Input
              label="Phone Number"
              defaultValue="9876543200"
              placeholder="Enter phone number"
            />
            <Input
              label="Email"
              type="email"
              defaultValue="info@littlestars.edu"
              placeholder="Enter email"
            />
            <Input
              label="Address"
              defaultValue="123, Green Park, New Delhi"
              placeholder="Enter address"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-500" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'System' },
                ].map(({ value, icon: Icon, label }) => (
                  <motion.button
                    key={value}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors ${
                      theme === value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${theme === value ? 'text-primary-500' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${theme === value ? 'text-primary-600' : 'text-gray-500'}`}>
                      {label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary-500" />
              Classes & Sections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {classes.map((cls, index) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{cls.name} - {cls.section}</h4>
                    <p className="text-sm text-gray-500">Capacity: {cls.capacity}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(cls)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(cls)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setShowAddClassModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Class
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {showAddClassModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                onClick={() => setShowAddClassModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Class</h3>
                    <button
                      onClick={() => setShowAddClassModal(false)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-4">
                    <Input
                      label="Class Name"
                      placeholder="e.g., Nursery, LKG, UKG"
                      value={newClass.name}
                      onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    />
                    <Input
                      label="Section"
                      placeholder="e.g., A, B, C"
                      value={newClass.section}
                      onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                    />
                    <Input
                      label="Capacity"
                      type="number"
                      placeholder="e.g., 30"
                      value={newClass.capacity}
                      onChange={(e) => setNewClass({ ...newClass, capacity: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowAddClassModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleAddClass}
                      isLoading={isAddingClass}
                    >
                      Add Class
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
              )}
            </AnimatePresence>

          <AnimatePresence>
            {showEditClassModal && selectedClass && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                onClick={() => setShowEditClassModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Class</h3>
                    <button
                      onClick={() => setShowEditClassModal(false)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-4">
                    <Input
                      label="Class Name"
                      placeholder="e.g., Nursery, LKG, UKG"
                      value={editClass.name}
                      onChange={(e) => setEditClass({ ...editClass, name: e.target.value })}
                    />
                    <Input
                      label="Section"
                      placeholder="e.g., A, B, C"
                      value={editClass.section}
                      onChange={(e) => setEditClass({ ...editClass, section: e.target.value })}
                    />
                    <Input
                      label="Capacity"
                      type="number"
                      placeholder="e.g., 30"
                      value={editClass.capacity}
                      onChange={(e) => setEditClass({ ...editClass, capacity: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowEditClassModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleUpdateClass}
                      isLoading={isEditingClass}
                    >
                      Update Class
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showDeleteConfirm && selectedClass && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Class</h3>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete <strong>{selectedClass.name} - {selectedClass.section}</strong>? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      onClick={handleDeleteClass}
                      isLoading={isDeletingClass}
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Attendance Alerts', description: 'Notify parents when student is absent' },
              { label: 'Fee Reminders', description: 'Send reminders for pending fees' },
              { label: 'Announcement Push', description: 'Push notifications for new announcements' },
              { label: 'Activity Updates', description: 'Send updates about school activities' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50"
              >
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{item.label}</h4>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
