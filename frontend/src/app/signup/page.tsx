'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Building2, User, Phone, Mail, MapPin, Lock, 
  ArrowRight, ArrowLeft, Check, Sparkles, Eye, EyeOff,
  School, Shield, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store'

interface FormData {
  schoolName: string
  ownerName: string
  phone: string
  email: string
  city: string
  address: string
  password: string
  confirmPassword: string
}

const STEPS = [
  { id: 1, title: 'School Info', description: 'Tell us about your school' },
  { id: 2, title: 'Contact Details', description: 'How can we reach you?' },
  { id: 3, title: 'Create Account', description: 'Secure your account' },
]

export default function SchoolSignupPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    schoolName: '',
    ownerName: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {}

    if (step === 1) {
      if (!formData.schoolName.trim()) newErrors.schoolName = 'School name is required'
      if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required'
    }

    if (step === 2) {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required'
      } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Enter a valid 10-digit phone number'
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Enter a valid email address'
      }
      if (!formData.city.trim()) newErrors.city = 'City is required'
      if (!formData.address.trim()) newErrors.address = 'Address is required'
    }

    if (step === 3) {
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
      setError('')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/school/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName: formData.schoolName,
          ownerName: formData.ownerName,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          address: formData.address,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.data.token)
      }

      setUser(data.data.user, data.data.token)
      setSuccess(true)

      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError((err as Error).message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <motion.div
            initial={false}
            animate={{
              backgroundColor: currentStep >= step.id ? '#6366f1' : '#e5e7eb',
              scale: currentStep === step.id ? 1.1 : 1,
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              currentStep >= step.id ? 'text-white' : 'text-gray-500'
            }`}
          >
            {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
          </motion.div>
          {index < STEPS.length - 1 && (
            <motion.div
              initial={false}
              animate={{
                backgroundColor: currentStep > step.id ? '#6366f1' : '#e5e7eb',
              }}
              className="w-16 h-1 mx-2"
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <Building2 className="w-8 h-8 text-primary-600" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900">School Information</h3>
        <p className="text-gray-500 mt-1">Let&apos;s start with your school details</p>
      </div>

      <Input
        label="School Name"
        type="text"
        placeholder="e.g., Little Stars Pre-School"
        icon={<School className="w-5 h-5" />}
        value={formData.schoolName}
        onChange={(e) => updateFormData('schoolName', e.target.value)}
        error={errors.schoolName}
      />

      <Input
        label="Owner / Principal Name"
        type="text"
        placeholder="e.g., Priya Sharma"
        icon={<User className="w-5 h-5" />}
        value={formData.ownerName}
        onChange={(e) => updateFormData('ownerName', e.target.value)}
        error={errors.ownerName}
      />
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <Phone className="w-8 h-8 text-secondary-600" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900">Contact Details</h3>
        <p className="text-gray-500 mt-1">How can parents and we reach you?</p>
      </div>

      <Input
        label="Phone Number"
        type="tel"
        placeholder="e.g., 9876543210"
        icon={<Phone className="w-5 h-5" />}
        value={formData.phone}
        onChange={(e) => updateFormData('phone', e.target.value)}
        error={errors.phone}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="e.g., admin@yourschool.com"
        icon={<Mail className="w-5 h-5" />}
        value={formData.email}
        onChange={(e) => updateFormData('email', e.target.value)}
        error={errors.email}
      />

      <Input
        label="City"
        type="text"
        placeholder="e.g., Mumbai"
        icon={<MapPin className="w-5 h-5" />}
        value={formData.city}
        onChange={(e) => updateFormData('city', e.target.value)}
        error={errors.city}
      />

      <Input
        label="Full Address"
        type="text"
        placeholder="e.g., 123, ABC Street, Andheri West"
        icon={<MapPin className="w-5 h-5" />}
        value={formData.address}
        onChange={(e) => updateFormData('address', e.target.value)}
        error={errors.address}
      />
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <Shield className="w-8 h-8 text-green-600" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900">Secure Your Account</h3>
        <p className="text-gray-500 mt-1">Create a strong password</p>
      </div>

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a strong password"
          icon={<Lock className="w-5 h-5" />}
          value={formData.password}
          onChange={(e) => updateFormData('password', e.target.value)}
          error={errors.password}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm your password"
          icon={<Lock className="w-5 h-5" />}
          value={formData.confirmPassword}
          onChange={(e) => updateFormData('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600"
        >
          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <p className="text-sm font-medium text-gray-700">Password requirements:</p>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}>
            {formData.password.length >= 8 && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
            At least 8 characters
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.password === formData.confirmPassword && formData.confirmPassword ? 'bg-green-500' : 'bg-gray-300'}`}>
            {formData.password === formData.confirmPassword && formData.confirmPassword && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className={formData.password === formData.confirmPassword && formData.confirmPassword ? 'text-green-600' : 'text-gray-500'}>
            Passwords match
          </span>
        </div>
      </div>
    </motion.div>
  )

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Check className="w-12 h-12 text-green-600" />
        </motion.div>
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Aboard!</h2>
      <p className="text-gray-600 mb-4">
        Your school account has been created successfully.
      </p>
      <p className="text-sm text-primary-600 font-medium">
        Redirecting to your dashboard...
      </p>
    </motion.div>
  )

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full" />
          <div className="absolute bottom-40 right-20 w-60 h-60 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative text-center text-white max-w-lg"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-8xl mb-8"
          >
            🏫
          </motion.div>
          <h1 className="text-4xl font-bold mb-4 font-display">Start Your Free Trial</h1>
          <p className="text-xl opacity-90 mb-8">
            Join 500+ schools already using Little Stars to manage their pre-schools
          </p>

          <div className="space-y-4 text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 bg-white/10 rounded-xl p-4"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">14-Day Free Trial</p>
                <p className="text-sm opacity-80">No credit card required</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4 bg-white/10 rounded-xl p-4"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Secure & Private</p>
                <p className="text-sm opacity-80">Your data is 100% protected</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 bg-white/10 rounded-xl p-4"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Setup in 2 Minutes</p>
                <p className="text-sm opacity-80">Get started instantly</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-3"
            >
              🏫
            </motion.div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white font-display">
              Create Your School Account
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            {!success && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-medium text-primary-500">
                    Step {currentStep} of 3
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 font-display">
                  {STEPS[currentStep - 1].title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {STEPS[currentStep - 1].description}
                </p>

                {renderStepIndicator()}
              </>
            )}

            <AnimatePresence mode="wait">
              {success ? (
                renderSuccess()
              ) : (
                <div key={currentStep}>
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                </div>
              )}
            </AnimatePresence>

            {error && !success && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </motion.div>
            )}

            {!success && (
              <div className="flex gap-3 mt-8">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex-1"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    className="flex-1"
                  >
                    Create School Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}

            {!success && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="font-semibold text-primary-500 hover:text-primary-600"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  )
}
