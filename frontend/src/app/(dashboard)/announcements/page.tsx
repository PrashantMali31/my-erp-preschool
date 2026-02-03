'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Megaphone, Calendar, BookOpen, PartyPopper, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDataStore } from '@/store'
import { generateId } from '@/lib/utils'
import { format } from 'date-fns'
import type { Announcement } from '@/types'

const typeIcons = {
  general: Megaphone,
  event: PartyPopper,
  holiday: Calendar,
  homework: BookOpen,
}

const typeColors = {
  general: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  event: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  holiday: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  homework: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
}

export default function AnnouncementsPage() {
  const { announcements, fetchAnnouncements, addAnnouncement, deleteAnnouncement } = useDataStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<Announcement['type']>('general')

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const announcement: Announcement = {
      id: generateId(),
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      type: selectedType,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin',
    }

    addAnnouncement(announcement)
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncement(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Announcements
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {announcements.length} announcements
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          New Announcement
        </Button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
{announcements.map((announcement, index) => {
              const Icon = typeIcons[announcement.type as keyof typeof typeIcons] || Megaphone
            return (
              <motion.div
                key={announcement.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeColors[announcement.type as keyof typeof typeColors] || typeColors.general}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {announcement.title}
                        </h3>
                        <Badge
                          variant={
                            announcement.type === 'event' ? 'info' :
                            announcement.type === 'holiday' ? 'warning' :
                            announcement.type === 'homework' ? 'success' : 'default'
                          }
                        >
                          {announcement.type}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {format(new Date(announcement.createdAt), 'dd MMM yyyy, hh:mm a')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {announcements.length === 0 && (
        <div className="text-center py-12">
          <Megaphone className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No announcements yet</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Announcement"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            required
            placeholder="Enter announcement title"
          />
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['general', 'event', 'holiday', 'homework'] as const).map(type => {
                const Icon = typeIcons[type]
                return (
                  <motion.button
                    key={type}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedType(type)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                      selectedType === type
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${selectedType === type ? 'text-primary-500' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium capitalize ${selectedType === type ? 'text-primary-600' : 'text-gray-500'}`}>
                      {type}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              name="content"
              required
              rows={4}
              placeholder="Enter announcement content..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Megaphone className="w-4 h-4" />
              Post Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
