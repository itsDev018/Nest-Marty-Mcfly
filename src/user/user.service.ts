import { Injectable, Headers } from '@nestjs/common';
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

  //Only the username took from auth token can be updated
  async editUser(userLogged: string, createUserDTO: CreateUserDTO): Promise<User>{
    const filter = { name: userLogged };

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

  async createMessage(text: string, to: string, from: string) {
    const user = await this.getUserData(to);
    this.generateNotification(to, from);

    if(user.online){
      let message = { text, to, from };

      const userWithMessage = await this.userModel.findOneAndUpdate({username: to},
                                    {$push: {messages: message}}, { new: true });
      return message;
    }

    return 'The user is offline'

  }

  async setStatus(createUserDTO: CreateUserDTO): Promise<User>{
    const filter = { name: createUserDTO.username };

    let updatedUser = await this.userModel.findOneAndUpdate(filter, { online: createUserDTO.online }, {
      new: true
    });
    return updatedUser;
  }

  async generateAuthToken(username: string) {
    const payload = { username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  getAccessToken(@Headers() headers) {
    const jwtData = this.jwtService.verify(headers.split(" ").pop())
    return jwtData.username;
  }

  async generateNotification(to, from) {
    let notification = { to, from }
    const userWithMessage = await this.userModel.findOneAndUpdate({username: to},
                                  {$push: {notifications: notification}}, { new: true });
  }
}
