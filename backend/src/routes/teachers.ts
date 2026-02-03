import { Router } from 'express';
import { Teacher, Class } from '../models';
import { createError } from '../middleware/errorHandler';
import { authenticate, authorize, checkPermission, AuthRequest, getSchoolFilter } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTeacherSchema, updateTeacherSchema } from '../schemas/teachers';

export const teachersRouter = Router();

teachersRouter.get('/', authenticate, checkPermission('teachers', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const { status, search, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const schoolFilter = getSchoolFilter(req);
    const query: Record<string, unknown> = { ...schoolFilter };

    if (status) query.status = status;
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { specialization: searchRegex },
      ];
    }

    const total = await Teacher.countDocuments(query);
    const teachers = await Teacher.find(query)
      .populate('assignedClasses', 'name section')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const teachersFormatted = teachers.map((t) => ({
      ...t.toObject(),
      id: t._id,
    }));

    res.json({
      status: 'success',
      data: { teachers: teachersFormatted },
      count: total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
});

teachersRouter.get('/:id', authenticate, checkPermission('teachers', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const teacher = await Teacher.findOne({ _id: req.params.id, ...schoolFilter }).populate('assignedClasses', 'name section');

    if (!teacher) {
      return next(createError('Teacher not found', 404));
    }

    res.json({
      status: 'success',
      data: {
        teacher: {
          ...teacher.toObject(),
          id: teacher._id,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

teachersRouter.post('/', authenticate, authorize('admin'), checkPermission('teachers', 'create'), validate(createTeacherSchema), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      joinDate,
      qualification,
      specialization,
      assignedClasses,
      address,
      salary,
    } = req.body;

    const existingTeacher = await Teacher.findOne({ email: email.toLowerCase(), ...schoolFilter });
    if (existingTeacher) {
      return next(createError('Email already exists', 409));
    }

    const teacher = new Teacher({
      ...schoolFilter,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      joinDate: joinDate ? new Date(joinDate) : new Date(),
      qualification,
      specialization,
      assignedClasses: assignedClasses || [],
      address,
      salary,
    });

    await teacher.save();

    res.status(201).json({
      status: 'success',
      data: {
        teacher: {
          ...teacher.toObject(),
          id: teacher._id,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

teachersRouter.put('/:id', authenticate, authorize('admin'), checkPermission('teachers', 'update'), validate(updateTeacherSchema), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const teacher = await Teacher.findOne({ _id: req.params.id, ...schoolFilter });

    if (!teacher) {
      return next(createError('Teacher not found', 404));
    }

    if (req.body.email && req.body.email !== teacher.email) {
      const existingTeacher = await Teacher.findOne({ email: req.body.email.toLowerCase(), ...schoolFilter });
      if (existingTeacher) {
        return next(createError('Email already exists', 409));
      }
    }

      const { schoolId, ...updateData } = req.body;
      
      if (updateData.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateData.dateOfBirth);
      }
      if (updateData.joinDate) {
        updateData.joinDate = new Date(updateData.joinDate);
      }
      
      Object.assign(teacher, updateData);
      await teacher.save();

    res.json({
      status: 'success',
      data: {
        teacher: {
          ...teacher.toObject(),
          id: teacher._id,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

teachersRouter.delete('/:id', authenticate, authorize('admin'), checkPermission('teachers', 'delete'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const classesWithTeacher = await Class.countDocuments({ teacherId: req.params.id, ...schoolFilter });
    if (classesWithTeacher > 0) {
      return next(createError('Cannot delete teacher with assigned classes', 400));
    }

    const teacher = await Teacher.findOneAndDelete({ _id: req.params.id, ...schoolFilter });

    if (!teacher) {
      return next(createError('Teacher not found', 404));
    }

    res.json({
      status: 'success',
      message: 'Teacher deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});
