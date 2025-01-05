import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto.';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/guard/auth.guard';


@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({summary: 'Sign up user'})
  @Post('signup') 
  async signUp(@Body() singUpData: SignUpDto) {
    
    return this.authService.signup(singUpData);
  }

  @ApiOperation({summary: 'Login user, acessToken expires in 2 minute and refreshToken expires in 5 minute.'})
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

  @UseGuards(AuthGuard)
  @ApiOperation({summary: 'Get user by Id'})
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }
}
