import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { PrismaService } from 'src/prisma/prisma.service';

import { AuthDto } from './dto';
import { Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signupLocal(dto: AuthDto): Promise<Tokens> {
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
        },
      });

      const { id: userId, email: userEmail } = user;
      const tokens = await this.signTokens(userId, userEmail);

      const { refresh_token } = tokens;
      await this.updateRtHash(userId, refresh_token as string);

      return tokens;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signinLocal(dto: AuthDto): Promise<Tokens> {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new ForbiddenException('Access Denied');

    const { hash, id: userId, email: userEmail } = user;

    const pwMatches = await argon.verify(hash, password);

    if (!pwMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.signTokens(userId, userEmail);

    const { refresh_token } = tokens;
    await this.updateRtHash(userId, refresh_token as string);

    return tokens;
  }

  async logout(userId: number) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: { hashedRt: null },
    });
  }

  async refreshTokens(userId: number, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new ForbiddenException('Access Denied');

    const { hashedRt, email } = user;

    if (!hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await argon.verify(hashedRt, rt);

    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.signTokens(userId, email);

    const { refresh_token } = tokens;
    await this.updateRtHash(userId, refresh_token as string);

    return tokens;
  }

  /* Utils */

  async updateRtHash(userId: number, rt: string) {
    const hashedRt = await argon.hash(rt);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt },
    });
  }

  async signTokens(userId: number, email: string): Promise<Tokens> {
    const at_secret: string | undefined = this.config.get('AT_SECRET');
    const rt_secret: string | undefined = this.config.get('RT_SECRET');

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          expiresIn: '15m',
          secret: at_secret,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          expiresIn: '7d',
          secret: rt_secret,
        },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
