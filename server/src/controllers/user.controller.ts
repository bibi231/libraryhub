import { Response, NextFunction } from 'express';
import { z } from 'zod';
import User from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';

export async function listUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { libraryCardNumber: { $regex: search, $options: 'i' } },
      ];
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [data, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash -refreshToken -resetToken')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);
    sendSuccess(res, { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -refreshToken -resetToken');
    if (!user) { sendError(res, 'User not found', 404); return; }
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const schema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      favoriteCategories: z.array(z.string()).optional(),
    });
    const updates = schema.parse(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select('-passwordHash -refreshToken -resetToken');
    if (!user) { sendError(res, 'User not found', 404); return; }
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { sendError(res, 'User not found', 404); return; }
    user.isActive = !user.isActive;
    await user.save();
    sendSuccess(res, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) {
    next(err);
  }
}
