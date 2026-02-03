import { Router } from 'express';
import { Student, Teacher, Class, Attendance, Fee } from '../models';
import { authenticate, authorize, checkPermission, AuthRequest } from '../middleware/auth';

export const reportsRouter = Router();

reportsRouter.get('/attendance', authenticate, checkPermission('reports', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const { startDate, endDate, classId } = req.query;

    const query: Record<string, unknown> = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) (query.date as Record<string, Date>).$gte = new Date(startDate as string);
      if (endDate) (query.date as Record<string, Date>).$lte = new Date(endDate as string);
    }
    if (classId) query.classId = classId;

    const attendance = await Attendance.find(query);
    const classes = await Class.find({ status: 'active' });

    const totalRecords = attendance.length;
    const present = attendance.filter((a) => a.status === 'present').length;
    const absent = attendance.filter((a) => a.status === 'absent').length;
    const late = attendance.filter((a) => a.status === 'late').length;
    const excused = attendance.filter((a) => a.status === 'excused').length;

    const byClass = await Promise.all(
      classes.map(async (c) => {
        const classAttendance = attendance.filter((a) => a.classId.toString() === c._id.toString());
        const classPresent = classAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
        return {
          classId: c._id,
          className: `${c.name} ${c.section}`,
          total: classAttendance.length,
          present: classPresent,
          absent: classAttendance.filter((a) => a.status === 'absent').length,
          attendanceRate: classAttendance.length > 0 ? Math.round((classPresent / classAttendance.length) * 100) : 0,
        };
      })
    );

    res.json({
      status: 'success',
      data: {
        report: {
          summary: {
            totalRecords,
            present,
            absent,
            late,
            excused,
            attendanceRate: totalRecords > 0 ? Math.round(((present + late) / totalRecords) * 100) : 0,
          },
          byClass,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

reportsRouter.get('/fees', authenticate, checkPermission('reports', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const { startDate, endDate, classId, feeType } = req.query;

    const query: Record<string, unknown> = {};

    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) (query.dueDate as Record<string, Date>).$gte = new Date(startDate as string);
      if (endDate) (query.dueDate as Record<string, Date>).$lte = new Date(endDate as string);
    }
    if (classId) query.classId = classId;
    if (feeType) query.feeType = feeType;

    const fees = await Fee.find(query);
    const classes = await Class.find({ status: 'active' });

    const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
    const paidAmount = fees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
    const pendingAmount = fees.filter((f) => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
    const overdueAmount = fees.filter((f) => f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0);

    const byClass = classes.map((c) => {
      const classFees = fees.filter((f) => f.classId.toString() === c._id.toString());
      const classTotal = classFees.reduce((sum, f) => sum + f.amount, 0);
      const classPaid = classFees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
      return {
        classId: c._id,
        className: `${c.name} ${c.section}`,
        totalAmount: classTotal,
        paidAmount: classPaid,
        pendingAmount: classTotal - classPaid,
        collectionRate: classTotal > 0 ? Math.round((classPaid / classTotal) * 100) : 0,
      };
    });

    const feeTypes = ['tuition', 'transport', 'meals', 'activities', 'other'];
    const byType = feeTypes.map((type) => {
      const typeFees = fees.filter((f) => f.feeType === type);
      const typeTotal = typeFees.reduce((sum, f) => sum + f.amount, 0);
      const typePaid = typeFees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
      return {
        feeType: type,
        totalAmount: typeTotal,
        paidAmount: typePaid,
        pendingAmount: typeTotal - typePaid,
      };
    });

    res.json({
      status: 'success',
      data: {
        report: {
          summary: {
            totalAmount,
            paidAmount,
            pendingAmount,
            overdueAmount,
            collectionRate: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0,
            totalRecords: fees.length,
            paidRecords: fees.filter((f) => f.status === 'paid').length,
            pendingRecords: fees.filter((f) => f.status === 'pending').length,
            overdueRecords: fees.filter((f) => f.status === 'overdue').length,
          },
          byClass,
          byType,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

reportsRouter.get('/students', authenticate, checkPermission('reports', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const { classId, status } = req.query;

    const query: Record<string, unknown> = {};
    if (classId) query.classId = classId;
    if (status) query.status = status;

    const students = await Student.find(query);
    const allStudents = await Student.find();
    const classes = await Class.find({ status: 'active' });

    const byClass = classes.map((c) => ({
      classId: c._id,
      className: `${c.name} ${c.section}`,
      totalStudents: allStudents.filter((s) => s.classId.toString() === c._id.toString()).length,
      activeStudents: allStudents.filter((s) => s.classId.toString() === c._id.toString() && s.status === 'active').length,
      capacity: c.capacity,
    }));

    const byGender = {
      male: students.filter((s) => s.gender === 'male').length,
      female: students.filter((s) => s.gender === 'female').length,
      other: students.filter((s) => s.gender === 'other').length,
    };

    res.json({
      status: 'success',
      data: {
        report: {
          summary: {
            totalStudents: students.length,
            activeStudents: students.filter((s) => s.status === 'active').length,
            inactiveStudents: students.filter((s) => s.status === 'inactive').length,
            graduatedStudents: students.filter((s) => s.status === 'graduated').length,
          },
          byClass,
          byGender,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

reportsRouter.get('/teachers', authenticate, authorize('admin'), checkPermission('reports', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.query;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const teachers = await Teacher.find(query);

    const totalSalary = teachers.reduce((sum, t) => sum + t.salary, 0);
    const avgSalary = teachers.length > 0 ? Math.round(totalSalary / teachers.length) : 0;

    const bySpecialization: Record<string, number> = {};
    teachers.forEach((t) => {
      if (t.specialization) {
        bySpecialization[t.specialization] = (bySpecialization[t.specialization] || 0) + 1;
      }
    });

    res.json({
      status: 'success',
      data: {
        report: {
          summary: {
            totalTeachers: teachers.length,
            activeTeachers: teachers.filter((t) => t.status === 'active').length,
            onLeaveTeachers: teachers.filter((t) => t.status === 'on-leave').length,
            totalSalaryExpense: totalSalary,
            averageSalary: avgSalary,
          },
          bySpecialization,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});
