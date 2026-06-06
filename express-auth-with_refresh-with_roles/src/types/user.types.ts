import type { UserRow } from '../schemas/user.schema';

export type Role = 'admin' | 'user';

// What we return from the API — never includes password
export type UserPublic = Omit<UserRow, 'password'>;

export type UserCreateInput = {
  username: string;
  email: string;
  password: string;
};

export type UserSetActiveInput = {
  requesterId: string;
  requesterRole: Role;
  targetId: string;
  isActive: boolean;
};

export type UserGetByIdInput = {
  requesterId: string;
  requesterRole: Role;
  targetId: string;
};
