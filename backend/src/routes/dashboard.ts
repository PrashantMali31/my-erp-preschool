import { Router } from 'express';
import { Student, Teacher, Class, Attendance, Fee, Announcement } from '../models';
import { authenticate, checkPermission, AuthRequest, getSchoolFilter } from '../middleware/auth';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', authenticate, checkPermission('dashboard', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    
    const totalStudents = await Student.countDocuments({ ...schoolFilter, status: 'active' });
    const totalTeachers = await Teacher.countDocuments({ ...schoolFilter, status: 'active' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayAttendance = await Attendance.find({
      ...schoolFilter,
      date: { $gte: today, $lte: todayEnd },
    });

    const presentToday = todayAttendance.filter(
      (a) => a.status === 'present' || a.status === 'late'
    ).length;

    const fees = await Fee.find(schoolFilter);
    const pendingFees = fees.filter((f) => f.status === 'pending' || f.status === 'overdue').length;

    const totalFeeAmount = fees.reduce((sum, f) => sum + f.amount, 0);
    const paidFeeAmount = fees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);

    const attendanceRate =
      todayAttendance.length > 0
        ? Math.round((presentToday / todayAttendance.length) * 100)
        : 0;

    const feeCollectionRate =
      totalFeeAmount > 0 ? Math.round((paidFeeAmount / totalFeeAmount) * 100) : 0;

    const recentAnnouncements = await Announcement.find({ ...schoolFilter, status: 'published' })
      .sort({ publishDate: -1 })
      .limit(5);

    const recentActivities = recentAnnouncements.map((a) => ({
      id: a._id.toString(),
      type: 'announcement',
      message: a.title,
      timestamp: a.publishDate.toISOString(),
    }));

    const upcomingEvents = recentAnnouncements
      .filter((a) => a.type === 'event')
      .map((a) => ({
        id: a._id.toString(),
        title: a.title,
        date: a.publishDate.toISOString(),
        type: a.type,
      }));

    res.json({
      status: 'success',
      data: {
        stats: {
          totalStudents,
          totalTeachers,
          presentToday,
          pendingFees,
          attendanceRate,
          feeCollectionRate,
          recentActivities,
          upcomingEvents,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

dashboardRouter.get('/classes', authenticate, checkPermission('dashboard', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const classes = await Class.find({ ...schoolFilter, status: 'active' }).populate('teacherId', 'firstName lastName');

    const classesWithStats = await Promise.all(
      classes.map(async (c) => {
        const studentCount = await Student.countDocuments({ classId: c._id, status: 'active', ...schoolFilter });
        const classObj = c.toObject();
        const teacher = classObj.teacherId as unknown as { firstName: string; lastName: string } | null;
        return {
          id: c._id,
          name: `${c.name} ${c.section}`,
          teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned',
          totalStudents: studentCount,
          capacity: c.capacity,
          status: c.status,
        };
      })
    );

    res.json({
      status: 'success',
      data: { classes: classesWithStats },
    });
  } catch (error) {
    next(error);
  }
});

dashboardRouter.get('/attendance-overview', authenticate, checkPermission('dashboard', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const days = 7;
    const overview = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      const dayAttendance = await Attendance.find({
        ...schoolFilter,
        date: { $gte: date, $lte: dateEnd },
      });

      const present = dayAttendance.filter(
        (a) => a.status === 'present' || a.status === 'late'
      ).length;
      const absent = dayAttendance.filter((a) => a.status === 'absent').length;

      overview.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        present,
        absent,
        total: dayAttendance.length,
      });
    }

    res.json({
      status: 'success',
      data: { attendanceOverview: overview },
    });
  } catch (error) {
    next(error);
  }
});

dashboardRouter.get('/fee-overview', authenticate, checkPermission('dashboard', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const fees = await Fee.find(schoolFilter);

    const feeTypes = ['tuition', 'transport', 'meals', 'activities', 'other'];
    const feeOverview: Record<string, { total: number; paid: number; pending: number }> = {};

    for (const type of feeTypes) {
      const typeFees = fees.filter((f) => f.feeType === type);
      const total = typeFees.reduce((sum, f) => sum + f.amount, 0);
      const paid = typeFees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
      feeOverview[type] = {
        total,
        paid,
        pending: total - paid,
      };
    }

    res.json({
      status: 'success',
      data: { feeOverview },
    });
  } catch (error) {
    next(error);
  }
});
