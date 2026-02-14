import { PrismaClient } from '@prisma/client/extension';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import  {Logger } from "winston"
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient<
  Prisma.PrismaClientOptions,
  string
> implements OnModuleInit{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super({
        log: [
            {
                email: 'event',
                level: 'info',
            },
            {
                email: 'event',
                level: 'warn',
            },
            {
                email: 'event',
                level: 'error',
            },
            {
                email: 'event',
                level: 'query',
            },
        ]
    });
  }
  onModuleInit() {
      this.$on('info', (e) => {
        this.logger.info(e);
      });
      this.$on('warn', (e) => {
        this.logger.warn(e);
      });
      this.$on('error', (e) => {
        this.logger.error(e);
      });
      this.$on('query', (e) => {
        this.logger.info(e);
      });
  }
}
