import { Controller, Get, Post, Put, Res, HttpStatus, Body,
         UseGuards, NotFoundException, Param, Headers } from '@nestjs/common';
import { CreateUserDTO, CreateMessageDTO } from './dto/user.dto';
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
    const user = await this.userService.loginUser(createUserDTO);

    if (!user) throw new NotFoundException('User does not exist!');

    if (bcrypt.compareSync(createUserDTO.password, user.password)){

      const accessToken = await this.userService.generateAuthToken(user.username)

      //In real-life enviroment like Kubide, I would prefer to store the JWT on a cookie or session :)
      return res.status(HttpStatus.OK).json({paste_on_next_requests: accessToken.access_token});
    }
    return res.status(400).json({err: 'Incorrect password'});
  }

  @UseGuards(JwtAuthGuard)
  @Put('/edit')
  async editUser(@Res() res, @Headers() headers, @Body() createUserDTO: CreateUserDTO) {
    const accessTokenUsername = this.userService.getAccessToken(headers.authorization);
    if(createUserDTO.password) createUserDTO.password = bcrypt.hashSync(createUserDTO.password, 10);

    const updatedUser =  await this.userService.editUser(accessTokenUsername, createUserDTO);
    return res.status(HttpStatus.OK).json(updatedUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get('info')
  async getUserData(@Res() res, @Headers() headers) {
    const accessTokenUsername = this.userService.getAccessToken(headers.authorization);
    const user = await this.userService.getUserData(accessTokenUsername);

    if (!user) throw new NotFoundException('User does not exist!');

    return res.status(HttpStatus.OK).json(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/active-users')
  async getActiveUsers(@Res() res) {
    const users = await this.userService.getActiveUsers();

    //Hidde users passwords
    users.forEach( function(value, index, array) {
      value.password = '';
    });

    return res.status(HttpStatus.OK).json(users);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/create-message')
  async createMessage(@Res() res, @Headers() headers, @Body() createMessageDTO: CreateMessageDTO) {
    const accessTokenUsername = this.userService.getAccessToken(headers.authorization);

    const message = await this.userService.createMessage(createMessageDTO.text,
                                      createMessageDTO.to, accessTokenUsername);

    return res.status(HttpStatus.OK).json({ message });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/check-messages')
  async checkMessages(@Res() res, @Headers() headers) {
    const accessTokenUsername = this.userService.getAccessToken(headers.authorization);

    const userData = await this.userService.getUserData(accessTokenUsername);
    const messages = userData.messages;

    return res.status(HttpStatus.OK).json(messages);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/set-status')
  async setStatus(@Res() res, @Body() createUserDTO: CreateUserDTO) {
    const updatedUser =  await this.userService.setStatus(createUserDTO);

    updatedUser.password = '';

    return res.status(HttpStatus.OK).json(updatedUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check-notifications')
  async checkNotifications(@Res() res, @Headers() headers) {
    const accessTokenUsername = this.userService.getAccessToken(headers.authorization);

    const userData = await this.userService.getUserData(accessTokenUsername);
    const notifications = userData.notifications;

    return res.status(HttpStatus.OK).json(notifications);
  }

}
