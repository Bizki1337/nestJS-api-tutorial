import { Controller, Get, UseGuards } from '@nestjs/common';

import { GetUser } from 'src/common/decorators';
import { JwtPayloadWithRt } from 'src/auth/types';
import { AtGuard } from 'src/common/guards';

@UseGuards(AtGuard)
@Controller('users')
export class UserController {
  @Get('me')
  getMe(@GetUser() user: JwtPayloadWithRt, @GetUser('email') email: string) {
    console.log('user', user);
    console.log('email', email);
    return user;
  }
}
