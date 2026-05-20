import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User';
import { generateLibraryCardNumber } from '../utils/cardNumber';
import { sendSuccess, sendError } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(7),
  address: z.string().min(5),
  idType: z.enum(['NIN', 'BVN', 'StudentID', 'StaffID']),
  idNumber: z.string().min(3),
  favoriteCategories: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signAccess(id: string, role: string, email: string) {
  return jwt.sign({ id, role, email }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}

function signRefresh(id: string) {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = registerSchema.parse(req.body);
    const exists = await User.findOne({ email: body.email });
    if (exists) {
      sendError(res, 'Email already registered', 409);
      return;
    }
    const passwordHash = await bcrypt.hash(body.password, 12);
    const libraryCardNumber = await generateLibraryCardNumber();
    const user = await User.create({
      ...body,
      passwordHash,
      libraryCardNumber,
      role: 'patron',
    });
    const accessToken = signAccess(user.id, user.role, user.email);
    const refreshToken = signRefresh(user.id);
    user.refreshToken = refreshToken;
    await user.save();
    const { passwordHash: _, refreshToken: __, ...userData } = user.toObject();
    sendSuccess(res, { user: userData, tokens: { accessToken, refreshToken } }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }
    const accessToken = signAccess(user.id, user.role, user.email);
    const refreshToken = signRefresh(user.id);
    user.refreshToken = refreshToken;
    await user.save();
    const { passwordHash: _, refreshToken: __, ...userData } = user.toObject();
    sendSuccess(res, { user: userData, tokens: { accessToken, refreshToken } });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) {
      sendError(res, 'Refresh token required', 400);
      return;
    }
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string };
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken) {
      sendError(res, 'Invalid refresh token', 401);
      return;
    }
    const accessToken = signAccess(user.id, user.role, user.email);
    const newRefresh = signRefresh(user.id);
    user.refreshToken = newRefresh;
    await user.save();
    sendSuccess(res, { accessToken, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.user!.id).select('-passwordHash -refreshToken -resetToken');
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await User.findByIdAndUpdate(req.user!.id, { $unset: { refreshToken: '' } });
    sendSuccess(res, null, 'Logged out');
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await User.findOne({ email });
    // Always return success to avoid email enumeration
    if (user) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
      user.resetToken = token;
      user.resetTokenExpiry = new Date(Date.now() + 3600000);
      await user.save();
    }
    sendSuccess(res, null, 'If that email exists, a reset link has been sent');
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = z.object({
      token: z.string(),
      password: z.string().min(8),
    }).parse(req.body);
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await User.findOne({
      _id: payload.id,
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });
    if (!user) {
      sendError(res, 'Invalid or expired reset token', 400);
      return;
    }
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    sendSuccess(res, null, 'Password reset successful');
  } catch (err) {
    next(err);
  }
}
