import { neon, Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || '';

export const isDbConfigured = Boolean(
  connectionString && 
  connectionString.startsWith('postgres') && 
  !connectionString.includes('ep-xyz.region')
);

// Serverless HTTP client for fast queries
export const sql = isDbConfigured ? neon(connectionString) : null;

// Pool instance if needed
export const pool = isDbConfigured ? new Pool({ connectionString }) : null;

export async function checkConnection(): Promise<{ connected: boolean; message: string; version?: string }> {
  if (!isDbConfigured || !sql) {
    return {
      connected: false,
      message: 'DATABASE_URL belum dikonfigurasi di file .env. Masukkan connection string dari Neon.tech.',
    };
  }

  try {
    const result = await sql`SELECT version()`;
    return {
      connected: true,
      message: 'Berhasil terhubung ke Neon PostgreSQL Database!',
      version: (result[0] as any)?.version || 'PostgreSQL (Neon)',
    };
  } catch (error: any) {
    console.error('Neon DB Connection error:', error);
    return {
      connected: false,
      message: `Gagal terhubung ke Neon DB: ${error?.message || error}`,
    };
  }
}
