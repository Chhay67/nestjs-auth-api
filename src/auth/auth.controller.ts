import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto.';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

// @ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({summary: 'Sign up user'})
  @Post('signup') 
  async signUp(@Body() singUpData: SignUpDto) {
    
    return this.authService.signup(singUpData);
  }

  @ApiOperation({summary: 'Login user'})
  // @ApiResponse({
  //   status:201,
  //   type:LoginDto
  // })
  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }
  
  @ApiOperation({summary: 'Refresh user token'})
  @Post('refresh-token')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }
}
