import { Router } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, School } from '../models';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, schoolSignupSchema } from '../schemas/auth';
import { getRolePermissions, Role } from '../config/rbac';
import { env } from '../config/env';

export const authRouter = Router();

/**
 * @openapi
 * /auth/school/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new school and admin user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [schoolName, ownerName, email, password, phone, address]
 *     responses:
 *       201:
 *         description: School registered successfully
 */
authRouter.post('/school/signup', validate(schoolSignupSchema), async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { schoolName, ownerName, email, phone, city, address, password } = req.body;

    const existingSchool = await School.findOne({ email: email.toLowerCase() }).session(session);
    if (existingSchool) {
      await session.abortTransaction();
      return next(createError('A school with this email already exists', 409));
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const school = new School({
      name: schoolName,
      email: email.toLowerCase(),
      phone,
      city,
      address,
      status: 'trial',
      subscriptionPlan: 'free',
      trialEndsAt,
    });

    await school.save({ session });

    const nameParts = ownerName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || nameParts[0];

    const adminUser = new User({
      schoolId: school._id,
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      phone,
      role: 'admin',
      status: 'active',
    });

    await adminUser.save({ session });

    await session.commitTransaction();

    const permissions = getRolePermissions('admin');

      const token = jwt.sign(
        {
          userId: adminUser._id,
          email: adminUser.email,
          role: adminUser.role,
          schoolId: school._id.toString(),
        },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as string }
      );

    res.status(201).json({
      status: 'success',
      message: 'School registered successfully! Your 14-day free trial has started.',
      data: {
        school: {
          id: school._id,
          name: school.name,
          email: school.email,
          status: school.status,
          trialEndsAt: school.trialEndsAt,
        },
        user: {
          id: adminUser._id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role,
          schoolId: school._id,
          permissions,
        },
        token,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).populate('schoolId');
    if (!user) {
      return next(createError('Invalid email or password', 401));
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return next(createError('Invalid email or password', 401));
    }

    if (user.status !== 'active') {
      return next(createError('Account is inactive', 403));
    }

    const school = await School.findById(user.schoolId);
    if (!school) {
      return next(createError('School not found', 404));
    }

    if (school.status === 'suspended') {
      return next(createError('Your school account has been suspended. Please contact support.', 403));
    }

    if (school.status === 'expired') {
      return next(createError('Your subscription has expired. Please renew to continue.', 403));
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const permissions = getRolePermissions(user.role as Role);

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
          schoolId: school._id.toString(),
        },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as string }
      );

    res.json({
      status: 'success',
      data: {
        school: {
          id: school._id,
          name: school.name,
          status: school.status,
          subscriptionPlan: school.subscriptionPlan,
        },
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          schoolId: user.schoolId,
          status: user.status,
          permissions,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return next(createError('User not found', 404));
    }

    const school = await School.findById(user.schoolId);
    if (!school) {
      return next(createError('School not found', 404));
    }

    const permissions = getRolePermissions(user.role as Role);

    res.json({
      status: 'success',
      data: {
        school: {
          id: school._id,
          name: school.name,
          status: school.status,
          subscriptionPlan: school.subscriptionPlan,
          settings: school.settings,
        },
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          schoolId: user.schoolId,
          status: user.status,
          permissions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/permissions', authenticate, async (req: AuthRequest, res) => {
  res.json({
    status: 'success',
    data: {
      role: req.user?.role,
      schoolId: req.user?.schoolId,
      permissions: req.user?.permissions,
    },
  });
});

authRouter.put('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) {
      return next(createError('User not found', 404));
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    await user.save();

    const permissions = getRolePermissions(user.role as Role);

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          schoolId: user.schoolId,
          status: user.status,
          permissions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.put('/change-password', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(createError('Current password and new password are required', 400));
    }

    if (newPassword.length < 8) {
      return next(createError('New password must be at least 8 characters', 400));
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      return next(createError('User not found', 404));
    }

    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return next(createError('Current password is incorrect', 401));
    }

    user.password = newPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
});
