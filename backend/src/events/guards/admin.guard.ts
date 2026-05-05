import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

interface JwtUser {
  id: string;
  email: string;
  role: string;
}

@Injectable()
export class AdminGuard extends AuthGuard('jwt') implements CanActivate {
  canActivate(context: ExecutionContext): Promise<boolean> {
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest<TUser = JwtUser>(err: Error | null, user: TUser): TUser {
    if (err || !user) {
      throw (
        err || new ForbiddenException('Only admins can perform this action')
      );
    }

    const jwtUser = user as unknown as { role: string };
    if (jwtUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can perform this action');
    }

    return user;
  }
}
