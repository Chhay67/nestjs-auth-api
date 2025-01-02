import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal :true,
      cache : true,
      load:[config],
    }),
    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      global:true,
      useFactory: async (config) => ({
        secret : config.get('jwt.jwtSecret'),
      })
    }),
    MongooseModule.forRootAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory: async (config) => ({
        uri : config.get('database.connectionString'),
      }),
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
