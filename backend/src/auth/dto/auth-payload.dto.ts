import { Request } from 'express';
import { UserEntity } from '@users/dto/user.interface';

export interface AuthPayload {
  sub: string;
  email: string;
  role: string;
}

export interface RequestWithUser extends Request {
  user: {
    user: UserEntity;
    accessToken: string;
  };
}
