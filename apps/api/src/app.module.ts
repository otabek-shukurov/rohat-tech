import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminController } from './modules/admin.controller';
import { AuthController } from './modules/auth.controller';
import { AuthService } from './modules/auth.service';
import { CartController } from './modules/cart.controller';
import { CatalogController } from './modules/catalog.controller';
import { OrdersController } from './modules/orders.controller';
import { PrismaService } from './prisma.service';
import { JwtStrategy } from './security/jwt.strategy';
import { RolesGuard } from './security/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'] }),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      signOptions: { expiresIn: '7d' }
    })
  ],
  controllers: [
    AuthController,
    CatalogController,
    CartController,
    OrdersController,
    AdminController
  ],
  providers: [PrismaService, AuthService, JwtStrategy, RolesGuard]
})
export class AppModule {}
