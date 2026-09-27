import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // اگر @Roles استفاده نشده، اجازه بده (بدون محدودیت نقش)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('احراز هویت نشده');
    }

    // ADMIN به همه چیز دسترسی دارد
    if (user.role === Role.ADMIN) {
      return true;
    }

    // بررسی اینکه آیا کاربر نقش مورد نیاز را دارد
    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      throw new ForbiddenException(
        `دسترسی غیرمجاز. نقش مورد نیاز: ${requiredRoles.join(' یا ')}، نقش شما: ${user.role}`
      );
    }

    return true;
  }
}
