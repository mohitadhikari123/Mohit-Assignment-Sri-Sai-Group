import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ,
  ACCESS_TOKEN_EXPIRY: '15m', 
  REFRESH_TOKEN_EXPIRY: '7d',
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, 
};