import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const Roles = (...roles: Array<'ADMIN' | 'CUSTOMER'>) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Array<'ADMIN' | 'CUSTOMER'>>('roles', [
      context.getHandler(),
      context.getClass()
    ]);
    if (!roles?.length) return true;
    const user = context.switchToHttp().getRequest().user;
    if (roles.includes(user?.role)) return true;
    throw new ForbiddenException('Bu amal uchun ruxsat yo‘q');
  }
}
