import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(name: string, username: string, password: string) {
    const userAlreadyExist = await this.userModel.findOne({ username });

    if (userAlreadyExist) {
      throw new BadRequestException('username already exist.');
    }

    return this.userModel.create({
      name,
      username,
      password,
    });
  }

  async findByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  async findById(id: string | Types.ObjectId) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('invalid user.');
    }

    const user = await this.userModel.findById(id);

    if (!user) {
      throw new BadRequestException('invalid user.');
    }

    return user;
  }

  async updatePassword(userId: string | Types.ObjectId, password: string) {
    await this.userModel.updateOne({ _id: userId }, { $set: { password } });
  }
}
