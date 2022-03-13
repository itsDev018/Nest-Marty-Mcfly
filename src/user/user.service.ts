import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import { User } from './interfaces/user.interface';
import { CreateUserDTO, CreateMessageDTO } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>,
              private jwtService: JwtService){}

  async createUser(createUserDTO: CreateUserDTO): Promise<User>{
    const newUser = await new this.userModel(createUserDTO);
    return newUser.save();
  }

  async loginUser(createUserDTO: CreateUserDTO): Promise<User>{
    const user = await this.userModel.findOne({username: createUserDTO.username});
    return user;
  }

  async editUser(createUserDTO: CreateUserDTO): Promise<User>{
    const filter = { name: createUserDTO.username };

    let updatedUser = await this.userModel.findOneAndUpdate(filter, createUserDTO, {
      new: true
    });
    return updatedUser;
  }

  async getUserData(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username });
    return user;
  }

  async getActiveUsers(): Promise<User[]> {
    const users = await this.userModel.find({ online: true });
    return users;
  }

  async createMessage(createMessageDTO: CreateMessageDTO) {
    let message = { text: createMessageDTO.text, to: createMessageDTO.to, from: createMessageDTO.from };

    const userWithMessage = await this.userModel.findOneAndUpdate({username: createMessageDTO.to},
                                  {$push: {messages: message}}, { new: true });
    return message;
  }

  async generateAuthToken(username: string) {
    const payload = { username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
