import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { PrismaService } from 'src/prisma/prisma.service';

import { AuthDto } from './dto';
import { ITokens } from 'src/common/interfaces';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    const { email, password } = dto;
    const hash = await argon.hash(password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      const { id: userId, email: userEmail } = user;

      return this.signToken(userId, userEmail);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    const { hash, id: userId, email: userEmail } = user;

    const pwMatches = await argon.verify(hash, password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    return this.signToken(userId, userEmail);
  }

  async signToken(userId: number, email: string): Promise<ITokens> {
    const payload = {
      sub: userId,
      email,
    };
    const secret: string | undefined = this.config.get('JWT_SECRET');

    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });

    return {
      access_token,
    };
  }
}
