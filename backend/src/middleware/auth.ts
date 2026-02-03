import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { createError } from './errorHandler';
import { Role, Resource, Action, hasPermission, getRolePermissions, Permission } from '../config/rbac';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    schoolId: string;
    permissions: Permission[];
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
      role: Role;
      schoolId: string;
    };

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      schoolId: decoded.schoolId,
      permissions: getRolePermissions(decoded.role),
    };
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return next(createError('Invalid token', 401));
  }
}

export function authorize(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.warn('Unauthorized access attempt - No user in request');
      return next(createError('Not authenticated', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}. Required roles: ${allowedRoles.join(', ')}`);
      return next(createError('Access denied. Insufficient permissions.', 403));
    }

    next();
  };
}

export function checkPermission(resource: Resource, action: Action) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.warn('Permission check failed - No user in request');
      return next(createError('Not authenticated', 401));
    }

    if (!hasPermission(req.user.role, resource, action)) {
      console.warn(`Permission denied for user ${req.user.id} (${req.user.role}) on ${resource}:${action}`);
      return next(createError(`Access denied. You don't have permission to ${action} ${resource}.`, 403));
    }

    next();
  };
}

export function checkAnyPermission(resource: Resource, actions: Action[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Not authenticated', 401));
    }

    const hasAny = actions.some((action) => hasPermission(req.user!.role, resource, action));

    if (!hasAny) {
      console.warn(`Permission denied for user ${req.user.id} (${req.user.role}) on ${resource}:${actions.join('|')}`);
      return next(createError(`Access denied. You don't have permission to access ${resource}.`, 403));
    }

    next();
  };
}

export function getSchoolFilter(req: AuthRequest): { schoolId: mongoose.Types.ObjectId } {
  if (!req.user?.schoolId) {
    throw new Error('School ID not found in request');
  }
  return { schoolId: new mongoose.Types.ObjectId(req.user.schoolId) };
}
