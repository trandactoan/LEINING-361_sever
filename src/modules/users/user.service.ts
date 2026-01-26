import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dtos/createUserDto';
import { ZaloUserInfoDto } from './dtos/zaloAuthDto';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super(userModel);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async findById(id: string): Promise<User | null> {
    return await this.userModel.findById(id).exec();
  }

  async findByZaloId(zaloId: string): Promise<User | null> {
    return await this.userModel.findOne({ zaloId }).exec();
  }

  async createOrUpdateFromZalo(zaloUserInfo: ZaloUserInfoDto): Promise<User> {
    const existingUser = await this.findByZaloId(zaloUserInfo.id);

    if (existingUser) {
      // Update existing user with latest Zalo user info
      const updated = await this.userModel
        .findOneAndUpdate(
          { zaloId: zaloUserInfo.id },
          {
            username: zaloUserInfo.name,
            avatar: zaloUserInfo.avatar,
          },
          { new: true }
        )
        .exec();
      return updated!;
    }

    // Create new user from Zalo user info
    const newUser = new this.userModel({
      zaloId: zaloUserInfo.id,
      username: zaloUserInfo.name,
      avatar: zaloUserInfo.avatar,
    });
    return newUser.save();
  }

  async update(id: string, createUserDto: CreateUserDto): Promise<User | null> {
    return await this.userModel
      .findByIdAndUpdate(id, createUserDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<User | null> {
    return await this.userModel.findByIdAndDelete(id).exec();
  }
}
