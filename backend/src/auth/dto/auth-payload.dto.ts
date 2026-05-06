import { Request } from 'express';
import { UserEntity } from '@users/dto/user.interface';
import { StrategyOptions } from 'passport-google-oauth20';

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

export interface RequestWithJwt extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface GoogleStrategyOptions extends StrategyOptions {
  accessType?: string;
  prompt?: string;
}
