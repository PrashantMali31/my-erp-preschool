export type Role = 'admin' | 'teacher' | 'parent';

export type Resource = 
  | 'students'
  | 'teachers'
  | 'classes'
  | 'attendance'
  | 'fees'
  | 'announcements'
  | 'reports'
  | 'settings'
  | 'dashboard'
  | 'users';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

export interface Permission {
  resource: Resource;
  actions: Action[];
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
}

export const ROLES: Record<Role, RolePermissions> = {
  admin: {
    role: 'admin',
    permissions: [
      { resource: 'students', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'teachers', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'classes', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'attendance', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'fees', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'announcements', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'reports', actions: ['read', 'manage'] },
      { resource: 'settings', actions: ['read', 'update', 'manage'] },
      { resource: 'dashboard', actions: ['read', 'manage'] },
      { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    ],
  },
  teacher: {
    role: 'teacher',
    permissions: [
      { resource: 'students', actions: ['read'] },
      { resource: 'teachers', actions: ['read'] },
      { resource: 'classes', actions: ['read'] },
      { resource: 'attendance', actions: ['create', 'read', 'update'] },
      { resource: 'fees', actions: ['read'] },
      { resource: 'announcements', actions: ['read'] },
      { resource: 'reports', actions: ['read'] },
      { resource: 'dashboard', actions: ['read'] },
    ],
  },
  parent: {
    role: 'parent',
    permissions: [
      { resource: 'students', actions: ['read'] },
      { resource: 'attendance', actions: ['read'] },
      { resource: 'fees', actions: ['read'] },
      { resource: 'announcements', actions: ['read'] },
      { resource: 'dashboard', actions: ['read'] },
    ],
  },
};

export function getRolePermissions(role: Role): Permission[] {
  return ROLES[role]?.permissions || [];
}

export function hasPermission(role: Role, resource: Resource, action: Action): boolean {
  const permissions = getRolePermissions(role);
  const resourcePermission = permissions.find((p) => p.resource === resource);
  if (!resourcePermission) return false;
  return resourcePermission.actions.includes(action) || resourcePermission.actions.includes('manage');
}

export function getAllowedActions(role: Role, resource: Resource): Action[] {
  const permissions = getRolePermissions(role);
  const resourcePermission = permissions.find((p) => p.resource === resource);
  return resourcePermission?.actions || [];
}

export function canAccessRoute(role: Role, path: string): boolean {
  const menuPermission = MENU_PERMISSIONS[path];
  if (!menuPermission) return true;
  return menuPermission.roles.includes(role);
}

export const MENU_PERMISSIONS: Record<string, { roles: Role[]; resource: Resource }> = {
  '/dashboard': { roles: ['admin', 'teacher', 'parent'], resource: 'dashboard' },
  '/students': { roles: ['admin', 'teacher', 'parent'], resource: 'students' },
  '/attendance': { roles: ['admin', 'teacher', 'parent'], resource: 'attendance' },
  '/fees': { roles: ['admin', 'teacher', 'parent'], resource: 'fees' },
  '/teachers': { roles: ['admin', 'teacher'], resource: 'teachers' },
  '/announcements': { roles: ['admin', 'teacher', 'parent'], resource: 'announcements' },
  '/reports': { roles: ['admin', 'teacher'], resource: 'reports' },
  '/settings': { roles: ['admin'], resource: 'settings' },
};
