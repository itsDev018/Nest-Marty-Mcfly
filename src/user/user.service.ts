import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { User } from './interfaces/user.interface';
import { CreateUserDTO } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>){}

  async createUser(createUserDTO: CreateUserDTO): Promise<User>{
    const newUser = await new this.userModel(createUserDTO);
    return newUser.save();
  }
}
