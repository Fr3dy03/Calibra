import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface AuthPrincipal {
  sub: string;       // user id
  email: string;
  role: 'LAB_ADMIN' | 'CALIBRATION_ISSUER' | 'INSTRUMENT_OWNER' | 'VIEWER';
  organisationId?: string;
}

/** Global JWT guard; public routes opt out with @Public(). */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = ReflectorPublic.getMetadata(ctx);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest();
    const header: string | undefined = req.headers?.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('missing bearer token');
    try {
      req.user = await this.jwt.verifyAsync(header.slice(7), { secret: process.env.JWT_SECRET ?? 'dev-secret' }) as AuthPrincipal;
      return true;
    } catch {
      throw new UnauthorizedException('invalid token');
    }
  }
}

/** Tiny reflect helper (avoids importing @nestjs/core Reflector in a guard). */
export const IS_PUBLIC_KEY = 'calibragraph:public';
export const ReflectorPublic = {
  getMetadata(ctx: ExecutionContext): boolean {
    return (
      Reflect.getMetadata(IS_PUBLIC_KEY, ctx.getHandler()) === true ||
      Reflect.getMetadata(IS_PUBLIC_KEY, ctx.getClass()) === true
    );
  },
};

export const Public = (): MethodDecorator & ClassDecorator => {
  return (target: object, key?: string | symbol, descriptor?) => {
    if (descriptor) Reflect.defineMetadata(IS_PUBLIC_KEY, true, descriptor.value);
    else Reflect.defineMetadata(IS_PUBLIC_KEY, true, target);
    return target as never;
  };
};
