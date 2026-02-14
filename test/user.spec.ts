import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import e from 'express';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UserController', () => {
  let app: INestApplication<App>;
  let logger: Logger;
  let testService: TestService;

  const prismaMock = {
    user: {
      deleteMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $on: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaMock.user.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.user.count.mockResolvedValue(0);
    prismaMock.user.create.mockImplementation(({ data }) =>
      Promise.resolve({
        id: 1,
        ...data,
      }),
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  describe('POST /api/users', () => {
    beforeEach(async () => {
      await testService.deleteUser();
    });

    it('should return 400 when validation fails', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: '',
          password: '',
          name: '',
        });
      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to register', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'test',
          password: 'test',
          name: 'test',
        });
      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test');
    });

    it('should be rejected when username already exists', async () => {
      prismaMock.user.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'test',
          password: 'test',
          name: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/users/login', () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      username: 'test',
      name: 'test',
      password: 'hashed',
      token: null,
    });

    prismaMock.user.update.mockImplementation(({ data }) =>
      Promise.resolve({
        id: 1,
        username: 'test',
        name: 'test',
        password: 'hashed',
        token: data.token,
      }),
    );

    it('should return 400 when validation fails', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: '',
          password: '',
        });
      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: 'test',
          password: 'test',
        });
      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.token).toBeDefined();
    });
  });

  describe('GET /api/users/current', () => {
    prismaMock.user.findFirst.mockImplementation(({ where }) => {
      if (where.token === 'test') {
        return Promise.resolve({
          id: 1,
          username: 'test',
          name: 'test',
          password: 'hashed',
          token: 'test',
        });
      }
      return Promise.resolve(null);
    });

    it('should return 400 when validation fails', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/current') // ✅ pakai GET
        .set('Authorization', 'wrong');
      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get current user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/current') // ✅ pakai GET
        .set('Authorization', 'test'); // token sesuai mock

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test');
    });
  });
});
