import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
}

/**
 * Generate access and refresh tokens
 */
export const generateTokens = (payload: JWTPayload) => {
  const accessToken = jwt.sign(
    payload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as SignOptions
  );

  const refreshToken = jwt.sign(
    payload,
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn } as SignOptions
  );

  return { accessToken, refreshToken };
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
