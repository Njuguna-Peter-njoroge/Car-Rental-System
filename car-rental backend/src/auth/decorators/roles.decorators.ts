import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const RequireRoles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const RequireAnyRole = (...roles: Role[]) =>
  SetMetadata(ROLES_KEY + '_ANY', roles);
