import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Permission, RolePermissions } from '../../../permissions/permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    const requiredAnyPermissions = this.reflector.getAllAndOverride<
      Permission[]
    >('permissions_ANY', [context.getHandler(), context.getClass()]);

    if (!requiredPermissions && !requiredAnyPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'];

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userPermissions = RolePermissions[user.role] || [];

    // Check for exact permissions match
    if (requiredPermissions) {
      const hasAllPermissions = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasAllPermissions) {
        throw new ForbiddenException(
          `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
        );
      }
    }

    // Check for any permissions match
    if (requiredAnyPermissions) {
      const hasAnyPermission = requiredAnyPermissions.some((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasAnyPermission) {
        throw new ForbiddenException(
          `Insufficient permissions. Required any of: ${requiredAnyPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }
}
