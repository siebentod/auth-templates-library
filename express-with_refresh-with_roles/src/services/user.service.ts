import { userRepository } from '../repositories/user.repository';
import { tokenRepository } from '../repositories/token.repository';
import { ForbiddenError, NotFoundError } from '../shared/errors';
import type { UserPublic, UserGetByIdInput, UserSetActiveInput } from '../types/user.types';

export const userService = {
  async getById({ requesterId, requesterRole, targetId }: UserGetByIdInput): Promise<UserPublic> {
    if (requesterRole !== 'admin' && requesterId !== targetId) {
      throw new ForbiddenError('Access denied');
    }

    const user = await userRepository.findById(targetId);
    if (!user) throw new NotFoundError('User not found');

    return user;
  },

  async getAll(): Promise<UserPublic[]> {
    return userRepository.findAll();
  },

  async setActive({
    requesterId,
    requesterRole,
    targetId,
    isActive,
  }: UserSetActiveInput): Promise<UserPublic> {
    if (requesterRole !== 'admin' && requesterId !== targetId) {
      throw new ForbiddenError('Access denied');
    }

    const user = await userRepository.findById(targetId);
    if (!user) throw new NotFoundError('User not found');

    const updated = await userRepository.setActive(targetId, isActive);
    if (!updated) throw new NotFoundError('User not found');

    // Invalidate all sessions when blocking
    if (!isActive) {
      await tokenRepository.deleteAllByUserId(targetId);
    }

    return updated;
  },
};
