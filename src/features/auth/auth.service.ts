import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signUpData: SignUpDto) {
    const { name, username, password } = signUpData;
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    await this.usersService.create(name, username, hashedPassword);
  }

  async login(credentials: LoginDto) {
    const { username, password } = credentials;
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('username invalid.');
    }

    const passwordIsValid = await this.validatePassword(password, user.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('username invalid.');
    }

    if (!this.isBcryptHash(user.password)) {
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      await this.usersService.updatePassword(user._id, hashedPassword);
    }

    const tokens = await this.generateAuthTokens(user._id);
    await this.storeRefreshToken(tokens.refreshToken, user._id);

    return {
      id: user._id,
      username: user.username,
      name: user.name,
      tokens,
    };
  }

  async refreshTokens(token: string) {
    let payload: { sub?: string; userId?: string };

    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Refresh Token is invalid');
    }

    const userId = payload.sub || payload.userId;
    const tokenModel = await this.refreshTokenModel.findOne({
      userId,
      expiryDate: { $gte: new Date() },
    });

    if (!tokenModel) {
      throw new UnauthorizedException('Refresh Token is invalid');
    }

    const tokenIsValid = await bcrypt.compare(token, tokenModel.hashedToken);

    if (!tokenIsValid) {
      throw new UnauthorizedException('Refresh Token is invalid');
    }

    const tokens = await this.generateAuthTokens(tokenModel.userId);
    await this.storeRefreshToken(tokens.refreshToken, tokenModel.userId);

    return tokens;
  }

  async logout(userId: string) {
    await this.refreshTokenModel.deleteOne({ userId });
    return { message: 'Logout successful' };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);

    return {
      id: user._id,
      username: user.username,
      name: user.name,
    };
  }

  async getUserById(id: string) {
    const user = await this.usersService.findById(id);

    return {
      name: user.name,
    };
  }

  private async generateAuthTokens(userId: Types.ObjectId | string) {
    const accessToken = this.generateUserToken(userId, this.configService.get<string>('jwt.accessTokenExpiresIn'));
    const refreshToken = this.generateUserToken(userId, this.configService.get<string>('jwt.refreshTokenExpiresIn'));

    return {
      accessToken,
      refreshToken,
    };
  }

  private generateUserToken(userId: Types.ObjectId | string, expiresIn: string) {
    const id = userId.toString();

    return this.jwtService.sign(
      {
        sub: id,
        userId: id,
      },
      { expiresIn },
    );
  }

  private async storeRefreshToken(token: string, userId: Types.ObjectId | string) {
    const hashedToken = await bcrypt.hash(token, this.saltRounds);
    const expiryDate = this.getRefreshTokenExpiryDate();

    await this.refreshTokenModel.updateOne(
      { userId },
      {
        $set: {
          hashedToken,
          expiryDate,
        },
      },
      {
        upsert: true,
      },
    );
  }

  private getRefreshTokenExpiryDate() {
    // Keep the original beginner-friendly 5 minute refresh window by default.
    const expiresIn = this.configService.get<string>('jwt.refreshTokenExpiresIn') || '5m';
    const minutes = expiresIn.endsWith('m') ? parseInt(expiresIn, 10) : 5;

    return new Date(Date.now() + minutes * 60 * 1000);
  }

  private async validatePassword(password: string, storedPassword: string) {
    if (this.isBcryptHash(storedPassword)) {
      return bcrypt.compare(password, storedPassword);
    }

    return password === storedPassword;
  }

  private isBcryptHash(password: string) {
    return password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$');
  }
}
