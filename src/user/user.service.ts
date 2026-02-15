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
import { User } from '@prisma/client';
import { request } from 'https';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private primaService: PrismaService,
  ) {}

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.debug(`Register new user ${JSON.stringify(request)}`);
    const registerRequest: RegisterUserRequest =
      this.validationService.validate(UserValidation.REGISTER, request);

    const totalUserWithSameUsername = await this.primaService.user.count({
      where: {
        username: registerRequest.username,
      },
    });

    if (totalUserWithSameUsername != 0) {
      throw new HttpException('Username already exists', 400);
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user = await this.primaService.user.create({
      data: registerRequest,
    });

    return {
      username: user.username,
      name: user.name,
    };
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.debug(`UserService Login user ${JSON.stringify(request)}`);

    const loginRequest: LoginUserRequest = this.validationService.validate(
      UserValidation.LOGIN,
      request,
    );

    let user = await this.primaService.user.findUnique({
      where: {
        username: loginRequest.username,
      },
    });

    if (!user) {
      throw new HttpException('Invalid username or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Invalid username or password', 401);
    }

    user = await this.primaService.user.update({
      where: {
        username: loginRequest.username,
      },
      data: {
        token: randomUUID(),
      },
    });

    return {
      username: user.username,
      name: user.name,
      token: user.token,
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

  // Validasi input
  const updateRequest: UpdateUserRequest = this.validationService.validate(
    UserValidation.UPDATE,
    request,
  );

  // Siapkan data update
  const dataToUpdate: Partial<User> = {};

  if (updateRequest.name) {
    dataToUpdate.name = updateRequest.name;
  }

  if (updateRequest.password) {
    dataToUpdate.password = await bcrypt.hash(updateRequest.password, 10);
  }

  // Update user di database
  const updatedUser = await this.primaService.user.update({
    where: { username: user.username },
    data: dataToUpdate,
  });

  // Kembalikan response
  return {
    username: updatedUser.username,
    name: updatedUser.name,
  };
}


}
