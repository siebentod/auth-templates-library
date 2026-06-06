import type { Role, UserPublic } from './user.types';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResult = TokenPair & {
  user: UserPublic;
};

export type AccessTokenResponse = {
  accessToken: string;
};

export type LoginResponse = AccessTokenResponse & {
  user: UserPublic;
};

export type JwtPayload = {
  sub: string;   // user id
  role: Role;
  iat?: number;
  exp?: number;
};
