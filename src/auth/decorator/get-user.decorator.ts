import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import {
  UserKeysType,
  UserValuesType,
  UserWithoutHashType,
} from 'src/common/interfaces';

export const GetUser = createParamDecorator(
  (data: UserKeysType | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (data) return request.user?.[data] as UserValuesType;
    return request.user as UserWithoutHashType;
  },
);
