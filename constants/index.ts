import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env' });

export const DOMAIN_URL = process.env.DOMAIN_URL;

// JWT token expiration times
export const ACCESS_TOKEN_EXPIRATION = '3d';
export const REFRESH_TOKEN_EXPIRATION = '15d';
export const VERIFICATION_TOKEN_EXPIRATION = '12h';
export const VERIFICATION_CODE_EXPIRATION_MS = 5 * 60 * 1000;
export const JWT_DEFAULT_EXPIRATION = '15m';
