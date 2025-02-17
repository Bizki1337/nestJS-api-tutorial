import { User } from '@prisma/client';

export interface ITokens {
  access_token: string;
  // refresh_token: string;
}

export type UserWithoutHashType = Omit<User, 'hash'>;

export type UserKeysType = keyof User;
export type UserValuesType = UserWithoutHashType[keyof UserWithoutHashType];
