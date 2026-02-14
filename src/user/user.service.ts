import { HttpException, Inject, Injectable } from '@nestjs/common';
import { RegisterUserRequest, UserResponse } from '../model/user.model';
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.service';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt'

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
}
