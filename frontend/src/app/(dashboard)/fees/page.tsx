'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IndianRupee, Search, Filter, Check, Clock, AlertCircle, Download, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { useDataStore } from '@/store'
import { formatCurrency, generateId } from '@/lib/utils'
import type { Fee } from '@/types'

export default function FeesPage() {
  const { fees, fetchFees, updateFee } = useDataStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'due' | 'partial'>('all')
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || fee.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0)
  const collectedAmount = fees.reduce((sum, f) => sum + f.paidAmount, 0)
  const pendingAmount = totalAmount - collectedAmount

  const handleCollectPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFee) return

    const formData = new FormData(e.currentTarget)
    const amount = Number(formData.get('amount'))
    const method = formData.get('method') as 'cash' | 'upi' | 'bank'

    const newPaidAmount = selectedFee.paidAmount + amount
    const newStatus = newPaidAmount >= selectedFee.amount ? 'paid' : 'partial'

    updateFee(selectedFee.id, {
      paidAmount: newPaidAmount,
      status: newStatus,
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod: method,
      receiptNo: `RCP${generateId().toUpperCase()}`,
    })

    setIsPaymentModalOpen(false)
    setSelectedFee(null)
  }

  const getStatusBadge = (status: Fee['status']) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success"><Check className="w-3 h-3 mr-1" /> Paid</Badge>
      case 'partial':
        return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Partial</Badge>
      case 'due':
        return <Badge variant="danger"><AlertCircle className="w-3 h-3 mr-1" /> Due</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Fee Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            January 2026
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(collectedAmount)}
            </p>
            <p className="text-sm text-gray-500">Collected</p>
          </div>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-900/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(pendingAmount)}
            </p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by student name..."
            icon={<Search className="w-5 h-5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'paid', 'due', 'partial'] as const).map(status => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filteredFees.map((fee, index) => (
            <motion.div
              key={fee.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <IndianRupee className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {fee.studentName}
                    </h4>
                    <p className="text-sm text-gray-500">{fee.className} • {fee.month}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(fee.amount)}
                    </p>
                    {fee.status === 'partial' && (
                      <p className="text-xs text-gray-500">
                        Paid: {formatCurrency(fee.paidAmount)}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(fee.status)}
                  {fee.status !== 'paid' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedFee(fee)
                        setIsPaymentModalOpen(true)
                      }}
                    >
                      Collect
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredFees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No fee records found</p>
        </div>
      )}

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false)
          setSelectedFee(null)
        }}
        title="Collect Payment"
      >
        {selectedFee && (
          <form onSubmit={handleCollectPayment} className="space-y-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Student</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedFee.studentName}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(selectedFee.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pending</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(selectedFee.amount - selectedFee.paidAmount)}
                </span>
              </div>
            </div>

            <Input
              label="Amount to Collect"
              name="amount"
              type="number"
              required
              defaultValue={selectedFee.amount - selectedFee.paidAmount}
              max={selectedFee.amount - selectedFee.paidAmount}
              icon={<IndianRupee className="w-5 h-5" />}
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['cash', 'upi', 'bank'] as const).map(method => (
                  <label
                    key={method}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-900/20 transition-colors"
                  >
                    <input
                      type="radio"
                      name="method"
                      value={method}
                      defaultChecked={method === 'cash'}
                      className="sr-only"
                    />
                    <span className="font-medium capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center gap-3">
              <QrCode className="w-12 h-12 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">UPI Payment</p>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  Scan QR code or use UPI ID: school@upi
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setIsPaymentModalOpen(false)
                  setSelectedFee(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                <Check className="w-4 h-4" />
                Confirm Payment
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
