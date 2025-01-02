import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserDocument } from './schema/user.schema';
import mongoose, { Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken, RefreshTokenDocument } from './schema/refresh-token.schema';

@Injectable()
export class AuthService {

     constructor(
          @InjectModel(User.name) private UserModel: Model<UserDocument>, 
          @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>,
          private jwtService: JwtService,
     ) {

     }

     async signup(signUpData: SignUpDto) {
          console.log(signUpData);
          const { name, username, password } = signUpData;
          const userAlreadyExist = await this.UserModel.findOne({
               username: username,
          });
          if (userAlreadyExist) {
               throw new BadRequestException('username already exist.');
          }

          await this.UserModel.create({
               name: name,
               username: username,
               password: password,
          });
     }
     async login(credentials: LoginDto) {
          const { username, password } = credentials;
          const user = await this.UserModel.findOne({ username });
          if (!user) {
               throw new UnauthorizedException('username invalid.');
          }
          if (!password.includes(user.password)) {
               throw new UnauthorizedException('username invalid.');
          }
          //Generate JWT tokens
          const accessToken = await this.generateUserTokens(user._id, {expiresIn :'1h' });
          const refreshToken = await this.generateUserTokens(user._id, {expiresIn :'30d' });

          await this.storeRefreshToken(refreshToken,user._id);
          return {
               username: user.username,
               name: user.name,
               tokens:{
                    accessToken,
                    refreshToken,
               }
          };
     }

     async refreshTokens (token: string){
          const tokenModel = await this.refreshTokenModel.findOne({
               token: token,
               expiryDate: { $gte: new Date() },
             });
         
             if (!tokenModel) {
               throw new UnauthorizedException('Refresh Token is invalid');
             }
             const accessToken = await this.generateUserTokens(tokenModel.userId, {expiresIn :'1h' });
          const refreshToken = await this.generateUserTokens(tokenModel.userId, {expiresIn :'30d' });

          await this.storeRefreshToken(refreshToken,tokenModel.userId);
             return {
               accessToken,
               refreshToken
             };
     }

     async generateUserTokens(userId ,expires : {expiresIn : string}) {
          const token = this.jwtService.sign({ userId }, { expiresIn: expires.expiresIn });
          return token;
     }

     async storeRefreshToken(token: string, userId: mongoose.Types.ObjectId) {
          // Calculate expiry date 30 days from now
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
      
          await this.refreshTokenModel.updateOne(
            { userId },
            { $set: { expiryDate, token } },
            {
              upsert: true,
            },
          );
        }
}
