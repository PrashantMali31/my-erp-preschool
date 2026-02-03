import { Router } from 'express';
import { Fee, Student, Class } from '../models';
import { createError } from '../middleware/errorHandler';
import { authenticate, authorize, checkPermission, AuthRequest, getSchoolFilter } from '../middleware/auth';

export const feesRouter = Router();

feesRouter.get('/', authenticate, checkPermission('fees', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const { studentId, classId, status, feeType, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const schoolFilter = getSchoolFilter(req);
    const query: Record<string, unknown> = { ...schoolFilter };

    if (studentId) query.studentId = studentId;
    if (classId) query.classId = classId;
    if (status) query.status = status;
    if (feeType) query.feeType = feeType;

    const total = await Fee.countDocuments(query);
    const fees = await Fee.find(query)
      .populate('studentId', 'firstName lastName')
      .populate('classId', 'name section')
      .sort({ dueDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const feesFormatted = fees.map((f) => {
      const fee = f.toObject();
      const student = fee.studentId as { firstName: string; lastName: string } | null;
      const classInfo = fee.classId as { name: string; section: string } | null;
      return {
        ...fee,
        id: f._id,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        className: classInfo ? `${classInfo.name} ${classInfo.section}` : 'Unknown',
      };
    });

    res.json({
      status: 'success',
      data: { fees: feesFormatted },
      count: total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
});

feesRouter.get('/summary', authenticate, checkPermission('fees', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const fees = await Fee.find(schoolFilter);

    const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
    const paidAmount = fees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
    const pendingAmount = fees.filter((f) => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
    const overdueAmount = fees.filter((f) => f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0);

    res.json({
      status: 'success',
      data: {
        summary: {
          totalAmount,
          paidAmount,
          pendingAmount,
          overdueAmount,
          collectionRate: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

feesRouter.get('/:id', authenticate, checkPermission('fees', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const fee = await Fee.findOne({ _id: req.params.id, ...schoolFilter })
      .populate('studentId', 'firstName lastName')
      .populate('classId', 'name section');

    if (!fee) {
      return next(createError('Fee record not found', 404));
    }

    const feeObj = fee.toObject();
    const student = feeObj.studentId as { firstName: string; lastName: string } | null;
    const classInfo = feeObj.classId as { name: string; section: string } | null;

    res.json({
      status: 'success',
      data: {
        fee: {
          ...feeObj,
          id: fee._id,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
          className: classInfo ? `${classInfo.name} ${classInfo.section}` : 'Unknown',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

feesRouter.post('/', authenticate, authorize('admin'), checkPermission('fees', 'create'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const { studentId, classId, feeType, amount, dueDate, remarks } = req.body;

    if (!studentId || !classId || !feeType || !amount || !dueDate) {
      return next(createError('Student ID, class ID, fee type, amount, and due date are required', 400));
    }

    const student = await Student.findOne({ _id: studentId, ...schoolFilter });
    if (!student) {
      return next(createError('Student not found', 404));
    }

    const classInfo = await Class.findOne({ _id: classId, ...schoolFilter });
    if (!classInfo) {
      return next(createError('Class not found', 404));
    }

    const fee = new Fee({
      ...schoolFilter,
      studentId,
      classId,
      feeType,
      amount,
      dueDate: new Date(dueDate),
      remarks,
      createdBy: req.user?.id,
    });

    await fee.save();

    res.status(201).json({
      status: 'success',
      data: {
        fee: {
          ...fee.toObject(),
          id: fee._id,
          studentName: `${student.firstName} ${student.lastName}`,
          className: `${classInfo.name} ${classInfo.section}`,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

feesRouter.put('/:id', authenticate, authorize('admin'), checkPermission('fees', 'update'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const fee = await Fee.findOne({ _id: req.params.id, ...schoolFilter });

    if (!fee) {
      return next(createError('Fee record not found', 404));
    }

    const { schoolId, ...updateData } = req.body;
    Object.assign(fee, updateData);
    await fee.save();

    const updatedFee = await Fee.findById(fee._id)
      .populate('studentId', 'firstName lastName')
      .populate('classId', 'name section');

    const feeObj = updatedFee!.toObject();
    const student = feeObj.studentId as { firstName: string; lastName: string } | null;
    const classInfo = feeObj.classId as { name: string; section: string } | null;

    res.json({
      status: 'success',
      data: {
        fee: {
          ...feeObj,
          id: updatedFee!._id,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
          className: classInfo ? `${classInfo.name} ${classInfo.section}` : 'Unknown',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

feesRouter.post('/:id/pay', authenticate, authorize('admin'), checkPermission('fees', 'update'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const { paymentMethod, transactionId } = req.body;

    const fee = await Fee.findOne({ _id: req.params.id, ...schoolFilter })
      .populate('studentId', 'firstName lastName')
      .populate('classId', 'name section');

    if (!fee) {
      return next(createError('Fee record not found', 404));
    }

    if (fee.status === 'paid') {
      return next(createError('Fee already paid', 400));
    }

    fee.status = 'paid';
    fee.paidDate = new Date();
    fee.paymentMethod = paymentMethod || 'cash';
    fee.transactionId = transactionId;

    await fee.save();

    const feeObj = fee.toObject();
    const student = feeObj.studentId as { firstName: string; lastName: string } | null;
    const classInfo = feeObj.classId as { name: string; section: string } | null;

    res.json({
      status: 'success',
      data: {
        fee: {
          ...feeObj,
          id: fee._id,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
          className: classInfo ? `${classInfo.name} ${classInfo.section}` : 'Unknown',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

feesRouter.delete('/:id', authenticate, authorize('admin'), checkPermission('fees', 'delete'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const fee = await Fee.findOneAndDelete({ _id: req.params.id, ...schoolFilter });

    if (!fee) {
      return next(createError('Fee record not found', 404));
    }

    res.json({
      status: 'success',
      message: 'Fee record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});
