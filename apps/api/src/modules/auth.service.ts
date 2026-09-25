import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';

type AuthInput = {
  name?: string;
  email: string;
  phone?: string;
  password: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async register(input: AuthInput) {
    const exists = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw new BadRequestException('Bu email allaqachon ro‘yxatdan o‘tgan');

    const user = await this.prisma.user.create({
      data: {
        name: input.name ?? input.email.split('@')[0],
        email: input.email,
        phone: input.phone,
        password: await bcrypt.hash(input.password, 10),
        role: Role.CUSTOMER
      }
    });

    await this.prisma.cart.create({ data: { userId: user.id } });
    return this.session(user);
  }

  async login(input: AuthInput) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw new UnauthorizedException('Email yoki parol noto‘g‘ri');
    }
    return this.session(user);
  }

  private session(user: { id: string; name: string; email: string; role: Role; phone: string | null }) {
    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    };
  }
}
