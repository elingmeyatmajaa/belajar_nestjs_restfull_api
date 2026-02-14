import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { webResponse } from '../model/web.model';
import { LoginUserRequest, RegisterUserRequest, UserResponse } from '../model/user.model';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @HttpCode(200)
  async register(
    @Body() request: RegisterUserRequest,
  ): Promise<webResponse<UserResponse>> {
    const result = await this.userService.register(request);
    return {
      data: result,
    };
  }

  @Post('/login')
  @HttpCode(200)
  async login(
    @Body() request: LoginUserRequest,
  ): Promise<webResponse<UserResponse>> {
    const result = await this.userService.login(request);
    return {
      data: result,
    };
  }


  @Get('/current')
  @HttpCode(200)
  async get(@Auth() user): Promise<webResponse<UserResponse>> {
    const result = await this.userService.get(user);
    return {
      data: result,
    };
  }
}
