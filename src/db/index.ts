import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { Env, ENV_CONFIG } from '../config/env-config';
import dotenv from 'dotenv';

const sql = neon(Env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

export type DbType = typeof db;