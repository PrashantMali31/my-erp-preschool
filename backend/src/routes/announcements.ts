import { Router } from 'express';
import { Announcement } from '../models';
import { createError } from '../middleware/errorHandler';
import { authenticate, authorize, checkPermission, AuthRequest, getSchoolFilter } from '../middleware/auth';

export const announcementsRouter = Router();

announcementsRouter.get('/', authenticate, checkPermission('announcements', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const { type, status, targetAudience, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const schoolFilter = getSchoolFilter(req);
    const query: Record<string, unknown> = { ...schoolFilter };

    if (type) query.type = type;
    if (status) query.status = status;
    if (targetAudience) query.targetAudience = targetAudience;

    const total = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ publishDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const announcementsFormatted = announcements.map((a) => ({
      ...a.toObject(),
      id: a._id,
    }));

    res.json({
      status: 'success',
      data: { announcements: announcementsFormatted },
      count: total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
});

announcementsRouter.get('/active', authenticate, checkPermission('announcements', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const now = new Date();
    const announcements = await Announcement.find({
      ...schoolFilter,
      status: 'published',
      publishDate: { $lte: now },
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gte: now } }],
    })
      .sort({ priority: -1, publishDate: -1 })
      .limit(10);

    res.json({
      status: 'success',
      data: {
        announcements: announcements.map((a) => ({
          ...a.toObject(),
          id: a._id,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

announcementsRouter.get('/:id', authenticate, checkPermission('announcements', 'read'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const announcement = await Announcement.findOne({ _id: req.params.id, ...schoolFilter }).populate('createdBy', 'firstName lastName');

    if (!announcement) {
      return next(createError('Announcement not found', 404));
    }

    res.json({
      status: 'success',
      data: {
        announcement: {
          ...announcement.toObject(),
          id: announcement._id,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

announcementsRouter.post('/', authenticate, authorize('admin'), checkPermission('announcements', 'create'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const { title, content, type, targetAudience, priority, publishDate, expiryDate } = req.body;

    if (!title || !content) {
      return next(createError('Title and content are required', 400));
    }

    const announcement = new Announcement({
      ...schoolFilter,
      title,
      content,
      type: type || 'general',
      targetAudience: targetAudience || 'all',
      priority: priority || 'medium',
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      status: 'draft',
      createdBy: req.user?.id,
    });

    await announcement.save();

    res.status(201).json({
      status: 'success',
      data: {
        announcement: {
          ...announcement.toObject(),
          id: announcement._id,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

announcementsRouter.put('/:id', authenticate, authorize('admin'), checkPermission('announcements', 'update'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const announcement = await Announcement.findOne({ _id: req.params.id, ...schoolFilter });

    if (!announcement) {
      return next(createError('Announcement not found', 404));
    }

    const { schoolId, ...updateData } = req.body;
    Object.assign(announcement, updateData);
    await announcement.save();

    res.json({
      status: 'success',
      data: {
        announcement: {
          ...announcement.toObject(),
          id: announcement._id,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

announcementsRouter.post('/:id/publish', authenticate, authorize('admin'), checkPermission('announcements', 'update'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const announcement = await Announcement.findOne({ _id: req.params.id, ...schoolFilter });

    if (!announcement) {
      return next(createError('Announcement not found', 404));
    }

    announcement.status = 'published';
    if (!announcement.publishDate || announcement.publishDate > new Date()) {
      announcement.publishDate = new Date();
    }

    await announcement.save();

    res.json({
      status: 'success',
      data: {
        announcement: {
          ...announcement.toObject(),
          id: announcement._id,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

announcementsRouter.delete('/:id', authenticate, authorize('admin'), checkPermission('announcements', 'delete'), async (req: AuthRequest, res, next) => {
  try {
    const schoolFilter = getSchoolFilter(req);
    const announcement = await Announcement.findOneAndDelete({ _id: req.params.id, ...schoolFilter });

    if (!announcement) {
      return next(createError('Announcement not found', 404));
    }

    res.json({
      status: 'success',
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});
