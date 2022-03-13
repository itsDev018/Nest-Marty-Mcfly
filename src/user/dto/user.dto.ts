export class CreateUserDTO {
  username: string;
  password: string;
  online: boolean;
}

export class CreateMessageDTO {
  text: string;
  to: string;
  from: boolean;
}
