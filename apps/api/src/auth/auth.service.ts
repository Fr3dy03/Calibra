import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';
import type { AuthPrincipal } from '../common/jwt-auth.guard';

const scrypt = (password: string, salt = randomBytes(16).toString('hex')) =>
  `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;

function verify(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  async register(dto: { email: string; password: string; fullName: string; organisation?: string; role?: string }) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('email already registered');
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash: scrypt(dto.password),
        role: (dto.role as never) ?? 'INSTRUMENT_OWNER',
      },
    });
    if (dto.organisation) {
      const org = await this.prisma.organisation.create({
        data: { name: dto.organisation, kind: user.role === 'LAB_ADMIN' ? 'laboratory' : 'instrument_owner' },
      });
      await this.prisma.organisationMember.create({ data: { organisationId: org.id, userId: user.id, orgRole: 'owner' } });
      await this.prisma.user.update({ where: { id: user.id }, data: { organisationId: org.id } });
    }
    await this.audit.record({ actorId: user.id, action: 'user.register', entityType: 'user', entityId: user.id });
    return this.session(user.id, user.email, user.role, user.organisationId ?? undefined);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !verify(password, user.passwordHash)) throw new UnauthorizedException('invalid credentials');
    return this.session(user.id, user.email, user.role, user.organisationId ?? undefined);
  }

  private session(id: string, email: string, role: string, organisationId?: string) {
    const principal: AuthPrincipal = {
      sub: id, email,
      role: role as AuthPrincipal['role'],
      organisationId,
    };
    return { accessToken: this.jwt.sign(principal), principal };
  }
}
