import {
  Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Query, Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CertificateStatus } from '@prisma/client';

import { CertificatesService } from './certificates.service';
import { Public } from '../common/jwt-auth.guard';
import type { AuthPrincipal } from '../common/jwt-auth.guard';

@ApiTags('certificates')
@ApiBearerAuth()
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certs: CertificatesService) {}

  @Get()
  list(@Query('status') status?: CertificateStatus, @Query('instrumentId') instrumentId?: string) {
    return this.certs.list({ status, instrumentId });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.certs.get(id);
  }

  @Post(':id/validate')
  @HttpCode(200)
  validate(@Param('id') id: string, @Req() req: { user: AuthPrincipal }) {
    return this.certs.validate(id, req.user);
  }

  @Post(':id/issue')
  @HttpCode(200)
  issue(@Param('id') id: string, @Req() req: { user: AuthPrincipal }, @Body('note') note?: string) {
    return this.certs.issue(id, req.user, note);
  }

  @Post(':id/revoke')
  @HttpCode(200)
  revoke(@Param('id') id: string, @Req() req: { user: AuthPrincipal }, @Body('reason') reason: string) {
    return this.certs.revoke(id, req.user, reason);
  }

  @Post(':id/supersede')
  @HttpCode(200)
  supersede(@Param('id') id: string, @Req() req: { user: AuthPrincipal }, @Body('diff') diff?: Record<string, unknown>, @Body('approvalNote') approvalNote?: string) {
    if (diff) return this.certs.revise(id, req.user, diff, approvalNote);
    return this.certs.supersede(id, req.user);
  }
}
