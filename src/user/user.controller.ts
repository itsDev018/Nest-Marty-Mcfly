import { Controller, Get, Post, Put, Res, HttpStatus, Body } from '@nestjs/common';
import { CreateUserDTO } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/create')
  async createPost(@Res() res, @Body() createUserDTO: CreateUserDTO){
    try {
      const user = await this.userService.createUser(createUserDTO);

      return res.status(HttpStatus.OK).json({
        user
      });
      
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Duplicated username'
      });
    }
  }
}
