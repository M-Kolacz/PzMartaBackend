import dotenv from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env')) {
    dotenv.config({ path: '.env' });
}

export const ENVIRONMENT = process.env.NODE_ENV;

export const JWT_SECURITY = process.env.DATABASE_URL!;
export const DATABASE_URL = process.env.DATABASE_URL!;
export const SEND_GRID_API = process.env.SEND_GRID_API!;
