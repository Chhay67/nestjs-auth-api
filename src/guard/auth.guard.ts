import {
     Injectable,
     CanActivate,
     ExecutionContext,
     UnauthorizedException,
     Logger,
     BadRequestException,
   } from '@nestjs/common';
   import { JwtService } from '@nestjs/jwt';
   import { Observable } from 'rxjs';
   import { Request } from 'express';

@Injectable()  
export class AuthGuard implements CanActivate {


     constructor(private jwtService: JwtService) { }
     canActivate(
          context: ExecutionContext,
     ): boolean | Promise<boolean> | Observable<boolean> {
          const request = context.switchToHttp().getRequest();
          const token = this.extractTokenFromHeader(request);
          Logger.log(token);          
          if (!token) {
               throw new UnauthorizedException('Invalid token');
          }

          try {
               const payload = this.jwtService.verify(token);
               request.userId = payload.userId;
          } catch (e) {
               Logger.error(e.message);
               throw new BadRequestException(e.message);
          }
          return true;
     }

     private extractTokenFromHeader(request: Request): string | undefined {
          return request.headers.authorization?.split(' ')[1];
     }
}