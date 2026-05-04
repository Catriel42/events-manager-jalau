import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';

/**
 * PrismaService wraps the PrismaClient and manages its lifecycle.
 * NOTE: Prisma must be installed and configured (US-002) before
 * uncommenting the PrismaClient extension below.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  onModuleInit() {
    this.logger.log('PrismaService initialized (client not configured yet)');
  }

  onModuleDestroy() {
    this.logger.log('PrismaService destroyed');
  }
}
