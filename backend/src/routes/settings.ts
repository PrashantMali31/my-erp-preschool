import { Router } from 'express';
import { authenticate, authorize, checkPermission, AuthRequest } from '../middleware/auth';

export const settingsRouter = Router();

const schoolSettings = {
  schoolName: 'Little Stars Pre-School',
  address: '123 Education Lane, New Delhi, India',
  phone: '+91 11 2345 6789',
  email: 'info@littlestars.com',
  website: 'www.littlestars.com',
  academicYear: '2025-2026',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  schoolTimings: {
    startTime: '09:00',
    endTime: '14:00'
  },
  feeSettings: {
    lateFeePercentage: 5,
    gracePeriodDays: 7
  }
};

settingsRouter.get('/', authenticate, checkPermission('settings', 'read'), (req: AuthRequest, res) => {
  res.json({
    status: 'success',
    data: { settings: schoolSettings }
  });
});

settingsRouter.put('/', authenticate, authorize('admin'), checkPermission('settings', 'update'), (req: AuthRequest, res) => {
  Object.assign(schoolSettings, req.body);

  res.json({
    status: 'success',
    data: { settings: schoolSettings }
  });
});

settingsRouter.get('/academic-years', authenticate, (req, res) => {
  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`
  ];

  res.json({
    status: 'success',
    data: { academicYears }
  });
});
