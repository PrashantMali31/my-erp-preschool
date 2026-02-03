import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to sanitize user-supplied data to prevent NoSQL injection attacks.
 * It recursively removes any keys starting with $ or containing . from req.body, req.query, and req.params.
 */
export const sanitize = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any) => {
    if (obj instanceof Object) {
      for (const key in obj) {
        if (/^\$|.*\..*/.test(key)) {
          delete obj[key];
        } else {
          sanitizeObject(obj[key]);
        }
      }
    }
  };

  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);

  next();
};
