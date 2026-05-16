import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  LoginResponseDto,
  RefreshTokenResponseDto,
  UserProfileResponseDto,
} from './dto/auth-response.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. This endpoint does not return a response body.',
  })
  @ApiResponse({ status: 400, description: 'Username already exists or request body is invalid' })
  @ResponseMessage('Register successful')
  @Post('register')
  async register(@Body() signUpData: SignUpDto) {
    return this.authService.signup(signUpData);
  }

  @ApiOperation({
    summary: 'Login user, accessToken expires in 5 minutes and refreshToken expires in 1 day by default.',
  })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid username or password' })
  @ResponseMessage('Login successful')
  @HttpCode(200)
  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  @ApiOperation({ summary: 'Refresh user token' })
  @ApiResponse({ status: 200, type: RefreshTokenResponseDto })
  @ApiResponse({ status: 401, description: 'Refresh Token is invalid' })
  @ResponseMessage('Refresh token successful')
  @HttpCode(200)
  @Post('refresh-token')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and clear stored refresh token' })
  @ApiResponse({
    status: 201,
    description: 'Logout successful',
    schema: {
      example: {
        message: 'Logout successful',
      },
    },
  })
  @ResponseMessage('Logout successful')
  @HttpCode(200)
  @Post('logout')
  async logout(@CurrentUser() user: { userId: string }) {
    return this.authService.logout(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  @ResponseMessage('Profile fetched successfully')
  @Get('profile')
  async profile(@CurrentUser() user: { userId: string }) {
    return this.authService.getProfile(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by Id' })
  @ApiParam({
    name: 'id',
    example: '665f1f7d0f4f3a6a9a111111',
    description: 'MongoDB user id',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the same { name } shape as the original endpoint',
    schema: {
      example: {
        name: 'example',
      },
    },
  })
  @ResponseMessage('User fetched successfully')
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }
}
