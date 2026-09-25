import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CurrentUser } from '../security/current-user.decorator';
import { JwtAuthGuard } from '../security/auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService
  ) {}

  @Post('register')
  register(@Body() body: { name?: string; email: string; phone?: string; password: string }) {
    return this.auth.register(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: { id: string }) {
    return this.prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, phone: true, address: true, role: true }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(
    @CurrentUser() user: { id: string },
    @Body() body: { name?: string; phone?: string; address?: string }
  ) {
    return this.prisma.user.update({
      where: { id: user.id },
      data: { name: body.name, phone: body.phone, address: body.address },
      select: { id: true, name: true, email: true, phone: true, address: true, role: true }
    });
  }
}
