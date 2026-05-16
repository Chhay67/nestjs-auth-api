import { Module } from '@nestjs/common';
import { AuthModule } from './features/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { validateEnvironment } from './config/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './features/users/users.module';
import { ProductsModule } from './features/products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
      validate: validateEnvironment,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ProductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
