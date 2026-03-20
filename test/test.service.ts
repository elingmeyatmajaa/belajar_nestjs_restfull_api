import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async deleteUser() {
    await this.prismaService.user.deleteMany({
      where: {
        username: 'test',
      },
    });
  }

  async getUser(): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        username: 'test',
      },
    });
  }

 async createUser(data?: Partial<User>): Promise<User> {
  return this.prismaService.user.create({
    data: {
      username: data?.username ?? 'test',
      password: await bcrypt.hash(data?.password ?? 'test', 10),
      name: data?.name ?? 'test',
      token: data?.token ?? 'test',
    },
  });
}
}
