import { Inject, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from "winston";
import { Prisma, PrismaClient } from '@prisma/client'; // ✅ MUST be exactly this

@Injectable()
export class PrismaService extends PrismaClient<
  Prisma.PrismaClientOptions,
  'query' | 'info' | 'warn' | 'error'
> implements OnModuleInit, OnModuleDestroy {
  
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    // Calling super() with event-based logging
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();

    this.$on('query', (e) => this.logger.info(`SQL: ${e.query}`));
    this.$on('error', (e) => this.logger.error(e.message));
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}