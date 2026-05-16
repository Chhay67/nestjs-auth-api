import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  LoginResponseDto,
  RefreshTokenResponseDto,
  UserProfileResponseDto,
} from './dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Username already exists or request body is invalid' })
  @Post('signup')
  async signUp(@Body() signUpData: SignUpDto) {
    return this.authService.signup(signUpData);
  }

  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @Post('register')
  async register(@Body() signUpData: SignUpDto) {
    return this.authService.signup(signUpData);
  }

  @ApiOperation({
    summary: 'Login user, accessToken expires in 2 minutes and refreshToken expires in 5 minutes by default.',
  })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid username or password' })
  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  @ApiOperation({ summary: 'Refresh user token' })
  @ApiResponse({ status: 201, type: RefreshTokenResponseDto })
  @ApiResponse({ status: 401, description: 'Refresh Token is invalid' })
  @Post('refresh-token')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and clear stored refresh token' })
  @ApiResponse({ status: 201, description: 'Logout successful' })
  @Post('logout')
  async logout(@CurrentUser() user: { userId: string }) {
    return this.authService.logout(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  @Get('me')
  async me(@CurrentUser() user: { userId: string }) {
    return this.authService.getProfile(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  @Get('profile')
  async profile(@CurrentUser() user: { userId: string }) {
    return this.authService.getProfile(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by Id' })
  @ApiResponse({ status: 200, description: 'Returns the same { name } shape as the original endpoint' })
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }
}
