import { HttpException, Inject, Injectable } from '@nestjs/common';
import { RegisterUserRequest, UserResponse } from '../model/user.model';
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.service';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private primaService: PrismaService,
  ) {}

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.info(`Register new user ${JSON.stringify(request)}`);
    const registerRequest: RegisterUserRequest =
      this.validationService.validate(UserValidation.REGISTER, request);

    const totalUserWithSameUsername = await this.primaService.user.count({
      where: {
        username: registerRequest.username,
      },
    });

    if(totalUserWithSameUsername != 0){
        throw new HttpException('Username already exists', 400)
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);


    const user = await this.primaService.user.create({
        data: registerRequest
    })
     

    return {
        username: user.username,
        name : user.name,
    };
  }


  async login(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.info(`UserService Login user ${JSON.stringify(request)}`);
    
    const loginRequest: LoginUserRequest =
      this.validationService.validate(UserValidation.LOGIN, request);

    let user = await this.primaService.user.findUnique({
        where: {
            username: loginRequest.username,
        }
    });

    if(!user){
        throw new HttpException('Invalid username or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(loginRequest.password, user.password);

    if(!isPasswordValid){
        throw new HttpException('Invalid username or password', 401);
    }

    user = await this.primaService.user.update({
        where: {
            username: loginRequest.username,
        },
        data: {
            token: randomUUID(),
        }
    })

    return {
        username: user.username,
        name : user.name,
        token: user.token,
    };
  }

  async get(user: User): Promise<UserResponse> {
    return {
      username: user.username,
      name : user.name
    }
  }
}
