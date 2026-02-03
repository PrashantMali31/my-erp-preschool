import { Router } from 'express';
import { Class, Teacher, Student } from '../models';
import { createError } from '../middleware/errorHandler';
import { authenticate, authorize, checkPermission, AuthRequest, getSchoolFilter } from '../middleware/auth';

export const classesRouter = Router();

classesRouter.get('/', authenticate, checkPermission('classes', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const { status, search, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const schoolFilter = getSchoolFilter(req);
    const query: Record<string, unknown> = { ...schoolFilter };

    if (status) query.status = status;
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [{ name: searchRegex }, { section: searchRegex }];
    }

    const total = await Class.countDocuments(query);
    const classes = await Class.find(query)
      .populate('teacherId', 'firstName lastName')
      .sort({ name: 1, section: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const classesWithStats = await Promise.all(
      classes.map(async (c) => {
        const studentCount = await Student.countDocuments({ classId: c._id, status: 'active', ...schoolFilter });
        const classObj = c.toObject();
        const teacher = classObj.teacherId as unknown as { firstName: string; lastName: string } | null;
        return {
          ...classObj,
          id: c._id,
          teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned',
          currentStrength: studentCount,
        };
      })
    );

    res.json({
      status: 'success',
      data: { classes: classesWithStats },
      count: total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
});

classesRouter.get('/:id', authenticate, checkPermission('classes', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const classInfo = await Class.findOne({ _id: req.params.id, ...schoolFilter }).populate('teacherId', 'firstName lastName email');

    if (!classInfo) {
      return next(createError('Class not found', 404));
    }

    const students = await Student.find({ classId: classInfo._id, ...schoolFilter });
    const classObj = classInfo.toObject();
    const teacher = classObj.teacherId as unknown as { firstName: string; lastName: string; email: string } | null;

    res.json({
      status: 'success',
      data: {
        class: {
          ...classObj,
          id: classInfo._id,
          teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned',
          currentStrength: students.length,
          students: students.map((s) => ({ ...s.toObject(), id: s._id })),
          teacher,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

classesRouter.get('/:id/students', authenticate, checkPermission('classes', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const classInfo = await Class.findOne({ _id: req.params.id, ...schoolFilter });

    if (!classInfo) {
      return next(createError('Class not found', 404));
    }

    const students = await Student.find({ classId: classInfo._id, ...schoolFilter });

    res.json({
      status: 'success',
      data: { students: students.map((s) => ({ ...s.toObject(), id: s._id })) },
      count: students.length,
    });
  } catch (error) {
    next(error);
  }
});

classesRouter.post('/', authenticate, authorize('admin'), checkPermission('classes', 'create'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const { name, section, teacherId, capacity, academicYear, schedule } = req.body;

    if (!name || !section || !capacity) {
      return next(createError('Name, section, and capacity are required', 400));
    }

    let teacherName = 'Unassigned';
    if (teacherId) {
      const teacher = await Teacher.findOne({ _id: teacherId, ...schoolFilter });
      if (teacher) {
        teacherName = `${teacher.firstName} ${teacher.lastName}`;
      }
    }

    const currentYear = new Date().getFullYear();
    const newClass = new Class({
      ...schoolFilter,
      name,
      section,
      teacherId: teacherId || undefined,
      capacity,
      academicYear: academicYear || `${currentYear}-${currentYear + 1}`,
      schedule: schedule || [],
    });

    await newClass.save();

    res.status(201).json({
      status: 'success',
      data: {
        class: {
          ...newClass.toObject(),
          id: newClass._id,
          teacherName,
          currentStrength: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

classesRouter.put('/:id', authenticate, authorize('admin'), checkPermission('classes', 'update'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const classInfo = await Class.findOne({ _id: req.params.id, ...schoolFilter });

    if (!classInfo) {
      return next(createError('Class not found', 404));
    }

    let teacherName = 'Unassigned';
    if (req.body.teacherId) {
      const teacher = await Teacher.findOne({ _id: req.body.teacherId, ...schoolFilter });
      if (teacher) {
        teacherName = `${teacher.firstName} ${teacher.lastName}`;
      }
    }

    const { schoolId, ...updateData } = req.body;
    Object.assign(classInfo, updateData);
    await classInfo.save();

    const studentCount = await Student.countDocuments({ classId: classInfo._id, status: 'active', ...schoolFilter });

    res.json({
      status: 'success',
      data: {
        class: {
          ...classInfo.toObject(),
          id: classInfo._id,
          teacherName,
          currentStrength: studentCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

classesRouter.delete('/:id', authenticate, authorize('admin'), checkPermission('classes', 'delete'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const studentsInClass = await Student.countDocuments({ classId: req.params.id, ...schoolFilter });
    if (studentsInClass > 0) {
      return next(createError('Cannot delete class with enrolled students', 400));
    }

    const classInfo = await Class.findOneAndDelete({ _id: req.params.id, ...schoolFilter });

    if (!classInfo) {
      return next(createError('Class not found', 404));
    }

    res.json({
      status: 'success',
      message: 'Class deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});
