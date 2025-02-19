import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { JwtPayloadWithRt } from 'src/auth/types/jwtPayloadWithRt.type';

export const GetUser = createParamDecorator(
  (data: keyof JwtPayloadWithRt | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.user) throw new Error('No user in GetUser decorator');
    if (!data) return request.user;
    return request.user[data];
  },
);
