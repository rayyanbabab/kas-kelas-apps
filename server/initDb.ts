import { sql, isDbConfigured } from './db';
import { initialClassGroup, initialExpenses, initialNotifications, initialPayments, initialUsers } from '../src/data/mockData';

export async function initializeDatabase(forceReset = false) {
  if (!isDbConfigured || !sql) {
    console.log('Database URL not configured. Skipping Neon DB initialization.');
    return { success: false, message: 'DATABASE_URL not configured' };
  }

  try {
    console.log('Initializing Neon PostgreSQL schema...');

    if (forceReset) {
      await sql`DROP TABLE IF EXISTS notifications CASCADE;`;
      await sql`DROP TABLE IF EXISTS expenses CASCADE;`;
      await sql`DROP TABLE IF EXISTS payments CASCADE;`;
      await sql`DROP TABLE IF EXISTS class_group CASCADE;`;
      await sql`DROP TABLE IF EXISTS users CASCADE;`;
    }

    // 1. Create Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        role TEXT NOT NULL,
        avatar TEXT,
        class_id TEXT,
        class_name TEXT,
        member_qr_code TEXT,
        password TEXT DEFAULT '123456',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Migration: Ensure password column exists if table was created previously
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '123456';`;
    } catch (e) {
      // Ignore if already exists
    }

    // 2. Create Class Group Table
    await sql`
      CREATE TABLE IF NOT EXISTS class_group (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        treasurer_name TEXT,
        monthly_dues NUMERIC DEFAULT 24000,
        weekly_dues NUMERIC DEFAULT 6000,
        period TEXT,
        due_date INTEGER DEFAULT 10,
        bank_info JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Create Payments Table
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        amount NUMERIC NOT NULL,
        date TEXT NOT NULL,
        month_period TEXT,
        week_period TEXT,
        weeks_paid JSONB,
        method TEXT NOT NULL,
        status TEXT NOT NULL,
        transaction_id TEXT,
        proof_url TEXT,
        notes TEXT,
        verified_at TEXT,
        verified_by TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Create Expenses Table
    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        class_id TEXT,
        amount NUMERIC NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        receipt_url TEXT,
        recorded_by TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 5. Create Notifications Table
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TEXT NOT NULL,
        type TEXT NOT NULL
      );
    `;

    if (forceReset) {
      console.log('Cleaning all data and seeding only Admin account into Neon database...');

      // Seed Only Admin User
      for (const u of initialUsers) {
        await sql`
          INSERT INTO users (id, name, email, phone, role, avatar, class_id, class_name, member_qr_code, password)
          VALUES (${u.id}, ${u.name}, ${u.email}, ${u.phone}, ${u.role}, ${u.avatar}, ${u.classId}, ${u.className}, ${u.memberQrCode}, ${u.password || 'admin123'})
          ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password;
        `;
      }

      // Seed Class Group
      await sql`
        INSERT INTO class_group (id, name, treasurer_name, monthly_dues, weekly_dues, period, due_date, bank_info)
        VALUES (
          ${initialClassGroup.id},
          ${initialClassGroup.name},
          ${initialClassGroup.treasurerName},
          ${initialClassGroup.monthlyDues},
          ${initialClassGroup.weeklyDues},
          ${initialClassGroup.period},
          ${initialClassGroup.dueDate},
          ${JSON.stringify(initialClassGroup.bankInfo)}
        )
        ON CONFLICT (id) DO NOTHING;
      `;

      // Seed Welcome Notification
      for (const n of initialNotifications) {
        await sql`
          INSERT INTO notifications (id, user_id, title, message, is_read, created_at, type)
          VALUES (${n.id}, ${n.userId}, ${n.title}, ${n.message}, ${n.isRead}, ${n.createdAt}, ${n.type})
          ON CONFLICT (id) DO NOTHING;
        `;
      }

      console.log('Neon database successfully cleaned. Only Admin user exists.');
    }

    return { success: true, message: 'Neon PostgreSQL Schema ready' };
  } catch (error: any) {
    console.error('Error during database initialization:', error);
    return { success: false, message: error?.message || String(error) };
  }
}
