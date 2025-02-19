import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { JwtPayload } from 'src/auth/types';

export const GetUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;
    const { sub } = user;
    return sub;
  },
);
