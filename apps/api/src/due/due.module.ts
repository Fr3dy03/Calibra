import { Controller, Get, Module, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DueService } from './due.service';
import { PrismaService } from '../common/prisma.service';
import type { AuthPrincipal } from '../common/jwt-auth.guard';

@ApiTags('calibrations')
@ApiBearerAuth()
@Controller('calibrations')
export class DueController {
  constructor(private readonly due: DueService, private readonly prisma: PrismaService) {}

  @Get('due')
  list(@Query('organisationId') organisationId?: string) {
    return this.due.buckets(organisationId);
  }

  @Post('due/policy')
  setPolicy(@Req() req: { user: AuthPrincipal }, @Body() dto: { lapseDays: number }) {
    if (!req.user.organisationId) throw new Error('organisation required');
    return this.due.setPolicy(req.user.organisationId, dto.lapseDays);
  }

  @Get('due/policies')
  listPolicies(@Query('organisationId') organisationId: string) {
    return this.due.listPolicies(organisationId);
  }
}

@Module({
  controllers: [DueController],
  providers: [DueService, PrismaService],
})
export class DueModule {}
