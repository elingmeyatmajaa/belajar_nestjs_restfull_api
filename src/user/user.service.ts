import { HttpException, Inject, Injectable } from '@nestjs/common';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '../model/user.model';
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.service';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import type { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private primaService: PrismaService,
  ) {}

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.debug(`Register new user ${JSON.stringify(request)}`);

    const registerRequest =
      this.validationService.validate<RegisterUserRequest>(
        UserValidation.REGISTER,
        request,
      );

    const existingCount = await this.primaService.user.count({
      where: { username: registerRequest.username! }, // pastikan non-null
    });

    if (existingCount !== 0) {
      throw new HttpException('Username already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerRequest.password!, 10);

    // Buat user di database
    const user = await this.primaService.user.create({
      data: {
        username: registerRequest.username!,
        password: hashedPassword,
        name: registerRequest.name!,
      },
    });

    return {
      username: user.username,
      name: user.name,
    };
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.debug(`UserService Login user ${JSON.stringify(request)}`);

    const loginRequest = this.validationService.validate<LoginUserRequest>(
      UserValidation.LOGIN,
      request,
    );

    let user = await this.primaService.user.findUnique({
      where: { username: loginRequest.username! },
    });

    if (!user) {
      throw new HttpException('Invalid username or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password!,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Invalid username or password', 401);
    }

    user = await this.primaService.user.update({
      where: { username: user.username },
      data: { token: randomUUID() },
    });

    return {
      username: user.username,
      name: user.name,
      token: user.token ?? undefined, // ubah null jadi undefined
    };
  }

  async get(user: User): Promise<UserResponse> {
    return {
      username: user.username,
      name: user.name,
    };
  }

  async update(user: User, request: UpdateUserRequest): Promise<UserResponse> {
    this.logger.debug(
      `UserService Update user ${JSON.stringify(request)}, ${JSON.stringify(user)}`,
    );

    const updateRequest = this.validationService.validate<UpdateUserRequest>(
      UserValidation.UPDATE,
      request,
    );

    const dataToUpdate: Partial<User> = {};

    if (updateRequest.name) dataToUpdate.name = updateRequest.name;
    if (updateRequest.password)
      dataToUpdate.password = await bcrypt.hash(updateRequest.password, 10);

    const updatedUser = await this.primaService.user.update({
      where: { username: user.username },
      data: dataToUpdate,
    });

    return {
      username: updatedUser.username,
      name: updatedUser.name,
    };
  }

  async logout(user: User): Promise<UserResponse> {
    const result = await this.primaService.user.update({
      where: { username: user.username },
      data: { token: null },
    });

    return {
      username: result.username,
      name: result.name,
      token: result.token ?? undefined, // ubah null jadi undefined
    };
  }
}