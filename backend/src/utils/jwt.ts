import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env';

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  tokenId?: string; // For refresh token tracking
}

/**
 * Hash token for secure storage
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate access and refresh tokens
 */
export const generateTokens = (payload: JWTPayload) => {
  const accessToken = jwt.sign(
    payload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as SignOptions
  );

  // Add unique token ID for refresh token
  const tokenId = crypto.randomBytes(32).toString('hex');
  const refreshToken = jwt.sign(
    { ...payload, tokenId },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn } as SignOptions
  );

  return { accessToken, refreshToken, tokenId };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};
