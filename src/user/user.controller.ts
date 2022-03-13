import { Controller, Get, Post, Put, Res, HttpStatus, Body,
         UseGuards, NotFoundException } from '@nestjs/common';
import { CreateUserDTO } from './dto/user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as bcrypt from 'bcrypt';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/create')
  async createUser(@Res() res, @Body() createUserDTO: CreateUserDTO){
    try {
      const user = await this.userService.createUser(createUserDTO);

      //Hide password
      user.password = '';

      return res.status(HttpStatus.OK).json(user);

    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Duplicated username'
      });
    }
  }

  @Post('/login')
  async loginUser(@Res() res, @Body() createUserDTO: CreateUserDTO){
    console.log(process.env.TOKEN_SECRET);

    const user = await this.userService.loginUser(createUserDTO);

    if (!user) throw new NotFoundException('User does not exist!');

    if (bcrypt.compareSync(createUserDTO.password, user.password)){

      const accessToken = await this.userService.generateAuthToken(user.username)

      //In real-life enviroment like Kubide, I'll store the JWT on a cookie or session :)
      return res.status(HttpStatus.OK).json(accessToken);
    }
    return res.status(400).json({err: 'Incorrect password'});
  }

}
