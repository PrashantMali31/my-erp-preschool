import { Router } from 'express';
import { Student, Class } from '../models';
import { createError } from '../middleware/errorHandler';
import { authenticate, authorize, checkPermission, AuthRequest, getSchoolFilter } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createStudentSchema, updateStudentSchema } from '../schemas/students';

export const studentsRouter = Router();

studentsRouter.get('/', authenticate, checkPermission('students', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const { classId, status, search, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const schoolFilter = getSchoolFilter(req);
    const query: Record<string, unknown> = { ...schoolFilter };

    if (classId) query.classId = classId;
    if (status) query.status = status;
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { parentName: searchRegex },
        { parentEmail: searchRegex },
      ];
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('classId', 'name section')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const studentsWithClass = students.map((s) => {
      const student = s.toObject();
      const classInfo = student.classId as { name: string; section: string } | null;
      return {
        ...student,
        id: student._id,
        className: classInfo ? `${classInfo.name} ${classInfo.section}` : 'Unassigned',
      };
    });

    res.json({
      status: 'success',
      data: { students: studentsWithClass },
      count: total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
});

studentsRouter.get('/:id', authenticate, checkPermission('students', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const student = await Student.findOne({ _id: req.params.id, ...schoolFilter }).populate('classId', 'name section');

    if (!student) {
      return next(createError('Student not found', 404));
    }

    const studentObj = student.toObject();
    const classInfo = studentObj.classId as { name: string; section: string } | null;

    res.json({
      status: 'success',
      data: {
        student: {
          ...studentObj,
          id: studentObj._id,
          className: classInfo ? `${classInfo.name} ${classInfo.section}` : 'Unassigned',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

studentsRouter.post('/', authenticate, authorize('admin'), checkPermission('students', 'create'), validate(createStudentSchema), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      admissionDate,
      classId,
      parentName,
      parentEmail,
      parentPhone,
      address,
      bloodGroup,
      allergies,
      emergencyContact,
    } = req.body;

    const classExists = await Class.findOne({ _id: classId, ...schoolFilter });
    if (!classExists) {
      return next(createError('Class not found', 404));
    }

    const student = new Student({
      ...schoolFilter,
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
      classId,
      parentName,
      parentEmail,
      parentPhone,
      address,
      bloodGroup,
      allergies,
      emergencyContact,
    });

    await student.save();

    res.status(201).json({
      status: 'success',
      data: {
        student: {
          ...student.toObject(),
          id: student._id,
          className: `${classExists.name} ${classExists.section}`,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

studentsRouter.put('/:id', authenticate, authorize('admin'), checkPermission('students', 'update'), validate(updateStudentSchema), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const student = await Student.findOne({ _id: req.params.id, ...schoolFilter });

    if (!student) {
      return next(createError('Student not found', 404));
    }

    if (req.body.classId && req.body.classId !== student.classId.toString()) {
      const classExists = await Class.findOne({ _id: req.body.classId, ...schoolFilter });
      if (!classExists) {
        return next(createError('Class not found', 404));
      }
    }

      const { schoolId, ...updateData } = req.body;
      
      if (updateData.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateData.dateOfBirth);
      }
      if (updateData.admissionDate) {
        updateData.admissionDate = new Date(updateData.admissionDate);
      }
      
      Object.assign(student, updateData);
      await student.save();

    const updatedStudent = await Student.findById(student._id).populate('classId', 'name section');
    const studentObj = updatedStudent!.toObject();
    const classInfo = studentObj.classId as { name: string; section: string } | null;

    res.json({
      status: 'success',
      data: {
        student: {
          ...studentObj,
          id: studentObj._id,
          className: classInfo ? `${classInfo.name} ${classInfo.section}` : 'Unassigned',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

studentsRouter.delete('/:id', authenticate, authorize('admin'), checkPermission('students', 'delete'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const student = await Student.findOneAndDelete({ _id: req.params.id, ...schoolFilter });

    if (!student) {
      return next(createError('Student not found', 404));
    }

    res.json({
      status: 'success',
      message: 'Student deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});
