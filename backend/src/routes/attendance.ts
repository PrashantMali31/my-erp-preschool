import { Router } from 'express';
import { Attendance, Student, Class } from '../models';
import { createError } from '../middleware/errorHandler';
import { authenticate, authorize, checkPermission, AuthRequest, getSchoolFilter } from '../middleware/auth';

export const attendanceRouter = Router();

attendanceRouter.get('/', authenticate, checkPermission('attendance', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const { classId, date, startDate, endDate, status, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const schoolFilter = getSchoolFilter(req);
    const query: Record<string, unknown> = { ...schoolFilter };

    if (classId) query.classId = classId;
    if (status) query.status = status;
    if (date) {
      const dateObj = new Date(date as string);
      query.date = {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lt: new Date(dateObj.setHours(23, 59, 59, 999)),
      };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) (query.date as Record<string, Date>).$gte = new Date(startDate as string);
      if (endDate) (query.date as Record<string, Date>).$lte = new Date(endDate as string);
    }

    const total = await Attendance.countDocuments(query);
    const attendance = await Attendance.find(query)
      .populate('studentId', 'firstName lastName')
      .populate('classId', 'name section')
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const attendanceFormatted = attendance.map((a) => {
      const att = a.toObject();
      const student = att.studentId as { firstName: string; lastName: string } | null;
      const classInfo = att.classId as { name: string; section: string } | null;
      return {
        ...att,
        id: a._id,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        className: classInfo ? `${classInfo.name} ${classInfo.section}` : 'Unknown',
      };
    });

    res.json({
      status: 'success',
      data: { attendance: attendanceFormatted },
      count: total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
});

attendanceRouter.get('/summary', authenticate, checkPermission('attendance', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const { date, classId } = req.query;
    const dateObj = date ? new Date(date as string) : new Date();
    
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const schoolFilter = getSchoolFilter(req);
    const query: Record<string, unknown> = {
      ...schoolFilter,
      date: { $gte: startOfDay, $lte: endOfDay },
    };
    if (classId) query.classId = classId;

    const attendance = await Attendance.find(query);

    const summary = {
      date: dateObj.toISOString().split('T')[0],
      total: attendance.length,
      present: attendance.filter((a) => a.status === 'present').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
      late: attendance.filter((a) => a.status === 'late').length,
      excused: attendance.filter((a) => a.status === 'excused').length,
    };

    res.json({
      status: 'success',
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
});

attendanceRouter.post('/', authenticate, authorize('admin', 'teacher'), checkPermission('attendance', 'create'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const { studentId, classId, date, status, remarks } = req.body;

    if (!studentId || !classId || !date || !status) {
      return next(createError('Student ID, class ID, date, and status are required', 400));
    }

    const student = await Student.findOne({ _id: studentId, ...schoolFilter });
    if (!student) {
      return next(createError('Student not found', 404));
    }

    const classInfo = await Class.findOne({ _id: classId, ...schoolFilter });
    if (!classInfo) {
      return next(createError('Class not found', 404));
    }

    const dateObj = new Date(date);
    const existingAttendance = await Attendance.findOne({
      studentId,
      ...schoolFilter,
      date: {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lt: new Date(dateObj.setHours(23, 59, 59, 999)),
      },
    });

    if (existingAttendance) {
      existingAttendance.status = status;
      existingAttendance.remarks = remarks;
      await existingAttendance.save();

      return res.json({
        status: 'success',
        data: {
          attendance: {
            ...existingAttendance.toObject(),
            id: existingAttendance._id,
            studentName: `${student.firstName} ${student.lastName}`,
            className: `${classInfo.name} ${classInfo.section}`,
          },
        },
      });
    }

    const attendance = new Attendance({
      ...schoolFilter,
      studentId,
      classId,
      date: new Date(date),
      status,
      remarks,
      markedBy: req.user?.id,
    });

    await attendance.save();

    res.status(201).json({
      status: 'success',
      data: {
        attendance: {
          ...attendance.toObject(),
          id: attendance._id,
          studentName: `${student.firstName} ${student.lastName}`,
          className: `${classInfo.name} ${classInfo.section}`,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

attendanceRouter.post('/bulk', authenticate, authorize('admin', 'teacher'), checkPermission('attendance', 'create'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      return next(createError('Date and records array are required', 400));
    }

    const dateObj = new Date(date);
    const results = [];

    for (const record of records) {
      const { studentId, classId, status, remarks } = record;

      if (!studentId || !classId || !status) continue;

      const existingAttendance = await Attendance.findOne({
        studentId,
        ...schoolFilter,
        date: {
          $gte: new Date(new Date(dateObj).setHours(0, 0, 0, 0)),
          $lt: new Date(new Date(dateObj).setHours(23, 59, 59, 999)),
        },
      });

      if (existingAttendance) {
        existingAttendance.status = status;
        existingAttendance.remarks = remarks;
        await existingAttendance.save();
        results.push(existingAttendance);
      } else {
        const attendance = new Attendance({
          ...schoolFilter,
          studentId,
          classId,
          date: dateObj,
          status,
          remarks,
          markedBy: req.user?.id,
        });
        await attendance.save();
        results.push(attendance);
      }
    }

    res.json({
      status: 'success',
      data: { attendance: results.map((a) => ({ ...a.toObject(), id: a._id })) },
      count: results.length,
    });
  } catch (error) {
    next(error);
  }
});

attendanceRouter.put('/:id', authenticate, authorize('admin', 'teacher'), checkPermission('attendance', 'update'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const attendance = await Attendance.findOne({ _id: req.params.id, ...schoolFilter })
      .populate('studentId', 'firstName lastName')
      .populate('classId', 'name section');

    if (!attendance) {
      return next(createError('Attendance record not found', 404));
    }

    const { schoolId, ...updateData } = req.body;
    Object.assign(attendance, updateData);
    await attendance.save();

    const att = attendance.toObject();
    const student = att.studentId as { firstName: string; lastName: string } | null;
    const classInfo = att.classId as { name: string; section: string } | null;

    res.json({
      status: 'success',
      data: {
        attendance: {
          ...att,
          id: attendance._id,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
          className: classInfo ? `${classInfo.name} ${classInfo.section}` : 'Unknown',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});
