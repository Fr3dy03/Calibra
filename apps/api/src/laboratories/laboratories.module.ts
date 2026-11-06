import { Controller, Get, Module, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';

@ApiTags('laboratories')
@ApiBearerAuth()
@Controller('laboratories')
@Injectable()
export class LaboratoriesController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  @Get()
  list() {
    return this.prisma.laboratory.findMany({
      include: { scopes: true, accreditationReferences: true, signers: true, _count: { select: { certificates: true } } },
      orderBy: { name: 'asc' },
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.prisma.laboratory.findFirst({
      where: { OR: [{ id }, { registryId: id }] },
      include: {
        scopes: true, accreditationReferences: true, signers: true,
        certificates: { include: { instrument: true }, orderBy: { calibrationDate: 'desc' }, take: 50 },
      },
    });
  }
}

@Module({ controllers: [LaboratoriesController], providers: [PrismaService, AuditService] })
export class LaboratoriesModule {}
