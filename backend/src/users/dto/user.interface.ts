export interface UserEntity {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  provider: string;
  refresh_token?: string | null;
  access_token?: string | null;
  role: 'admin' | 'user';
  created_at: Date;
  updated_at: Date;
}

export interface UpsertUserDto {
  email: string;
  fullName: string;
  avatarUrl?: string;
  provider?: string;
  accessToken?: string;
  refreshToken?: string;
}
