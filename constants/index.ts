import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env' });

export const DOMAIN_URL = process.env.DOMAIN_URL;
