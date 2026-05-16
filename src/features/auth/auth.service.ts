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
    const refreshToken = this.normalizeToken(token);
    let payload: { sub?: string; userId?: string; tokenType?: string };

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.jwtSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh Token is invalid');
    }

    const userId = payload.sub || payload.userId;

    if (!userId || payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Refresh Token is invalid');
    }

    const tokenModel = await this.refreshTokenModel.findOne({
      userId,
    });

    if (!tokenModel || !tokenModel.hashedToken || tokenModel.expiryDate < new Date()) {
      throw new UnauthorizedException('Refresh Token is invalid');
    }

    const tokenIsValid = await bcrypt.compare(refreshToken, tokenModel.hashedToken);

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
    const accessToken = this.generateUserToken(
      userId,
      this.configService.get<string>('jwt.accessTokenExpiresIn') || '5m',
      'access',
    );
    const refreshToken = this.generateUserToken(
      userId,
      this.configService.get<string>('jwt.refreshTokenExpiresIn') || '1d',
      'refresh',
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private generateUserToken(userId: Types.ObjectId | string, expiresIn: string, tokenType: 'access' | 'refresh') {
    const id = userId.toString();

    return this.jwtService.sign(
      {
        sub: id,
        userId: id,
        tokenType,
      },
      {
        expiresIn,
        secret: this.configService.get<string>('jwt.jwtSecret'),
      },
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
    const expiresIn = this.configService.get<string>('jwt.refreshTokenExpiresIn') || '1d';
    const milliseconds = this.getDurationInMilliseconds(expiresIn);

    return new Date(Date.now() + milliseconds);
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

  private getDurationInMilliseconds(value: string) {
    const amount = parseInt(value, 10);
    const unit = value.replace(amount.toString(), '');

    if (unit === 's') {
      return amount * 1000;
    }

    if (unit === 'm') {
      return amount * 60 * 1000;
    }

    if (unit === 'h') {
      return amount * 60 * 60 * 1000;
    }

    if (unit === 'd') {
      return amount * 24 * 60 * 60 * 1000;
    }

    return 24 * 60 * 60 * 1000;
  }

  private normalizeToken(token: string) {
    return token.replace(/^Bearer\s+/i, '').trim();
  }
}
