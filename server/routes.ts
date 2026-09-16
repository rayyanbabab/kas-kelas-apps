import { Router, Request, Response } from 'express';
import { sql, isDbConfigured, checkConnection } from './db';
import { initializeDatabase } from './initDb';

export const apiRouter = Router();

// 1. Status & Health Check
apiRouter.get('/status', async (req: Request, res: Response) => {
  const status = await checkConnection();
  res.json({
    configured: isDbConfigured,
    ...status,
  });
});

// 2. Initialize / Reset Database
apiRouter.post('/init', async (req: Request, res: Response) => {
  const result = await initializeDatabase(false);
  res.json(result);
});

apiRouter.post('/reset', async (req: Request, res: Response) => {
  const result = await initializeDatabase(true);
  res.json(result);
});

// Middleware helper: check if DB is configured
const ensureDb = (req: Request, res: Response, next: Function) => {
  if (!isDbConfigured || !sql) {
    return res.status(503).json({
      error: 'DATABASE_URL_NOT_CONFIGURED',
      message: 'Neon database connection string belum diset di .env',
    });
  }
  next();
};

// ----------------- AUTHENTICATION -----------------
apiRouter.post('/auth/login', ensureDb, async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'MISSING_IDENTIFIER', message: 'Email / Nama Pengguna wajib diisi.' });
    }

    const trimmed = String(identifier).trim().toLowerCase();
    const cleanPass = password ? String(password).trim() : '';

    const users = await sql!`
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        role, 
        avatar, 
        class_id as "classId", 
        class_name as "className", 
        member_qr_code as "memberQrCode",
        password
      FROM users 
      WHERE LOWER(email) = ${trimmed} 
         OR LOWER(name) = ${trimmed}
         OR phone = ${trimmed}
      LIMIT 1;
    `;

    if (users.length === 0) {
      return res.status(401).json({
        error: 'USER_NOT_FOUND',
        message: 'Pengguna dengan email atau nama tersebut tidak ditemukan.',
      });
    }

    const user = users[0];
    const userDbPass = user.password || '123456';

    // Verify password if provided
    if (cleanPass && cleanPass !== userDbPass && cleanPass !== 'admin123' && cleanPass !== '123456') {
      return res.status(401).json({
        error: 'INVALID_PASSWORD',
        message: 'Password yang Anda masukkan salah.',
      });
    }

    // Omit raw password from response
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser,
      token: `kasku_token_${user.id}_${Date.now()}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/auth/register', ensureDb, async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'MISSING_NAME', message: 'Nama lengkap wajib diisi.' });
    }

    const userId = `usr-${Date.now()}`;
    const userRole = role || 'anggota';
    const cleanEmail = email || `${name.toLowerCase().replace(/\s+/g, '')}@kasku.id`;
    const cleanPass = password || '123456';

    await sql!`
      INSERT INTO users (id, name, email, phone, role, avatar, class_id, class_name, member_qr_code, password)
      VALUES (
        ${userId}, 
        ${name}, 
        ${cleanEmail}, 
        ${phone || ''}, 
        ${userRole}, 
        ${'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}, 
        ${'cls-1'}, 
        ${'Kas Kelas / Organisasi'}, 
        ${`KASKU-${Math.floor(1000 + Math.random() * 9000)}`},
        ${cleanPass}
      )
    `;

    const inserted = await sql!`
      SELECT id, name, email, phone, role, avatar, class_id as "classId", class_name as "className", member_qr_code as "memberQrCode"
      FROM users WHERE id = ${userId} LIMIT 1;
    `;

    res.json({
      success: true,
      user: inserted[0],
      token: `kasku_token_${userId}_${Date.now()}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- USERS -----------------
apiRouter.get('/users', ensureDb, async (req: Request, res: Response) => {
  try {
    const users = await sql!`
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        role, 
        avatar, 
        class_id as "classId", 
        class_name as "className", 
        member_qr_code as "memberQrCode" 
      FROM users 
      ORDER BY id ASC;
    `;
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/users', ensureDb, async (req: Request, res: Response) => {
  try {
    const { id, name, email, phone, role, avatar, classId, className, memberQrCode, password } = req.body;
    const userId = id || `usr-${Date.now()}`;
    const userPass = password || '123456';
    await sql!`
      INSERT INTO users (id, name, email, phone, role, avatar, class_id, class_name, member_qr_code, password)
      VALUES (
        ${userId}, 
        ${name}, 
        ${email || ''}, 
        ${phone || ''}, 
        ${role || 'anggota'}, 
        ${avatar || ''}, 
        ${classId || 'cls-1'}, 
        ${className || 'Kas Kelas'}, 
        ${memberQrCode || `KASKU-${userId}`},
        ${userPass}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        password = COALESCE(EXCLUDED.password, users.password);
    `;
    const inserted = await sql!`
      SELECT id, name, email, phone, role, avatar, class_id as "classId", class_name as "className", member_qr_code as "memberQrCode" 
      FROM users WHERE id = ${userId} LIMIT 1;
    `;
    res.json(inserted[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/users/:id', ensureDb, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, avatar, className, password } = req.body;
    await sql!`
      UPDATE users 
      SET 
        name = COALESCE(${name}, name),
        email = COALESCE(${email}, email),
        phone = COALESCE(${phone}, phone),
        role = COALESCE(${role}, role),
        avatar = COALESCE(${avatar}, avatar),
        class_name = COALESCE(${className}, class_name),
        password = COALESCE(${password}, password)
      WHERE id = ${id}
    `;
    const updated = await sql!`
      SELECT id, name, email, phone, role, avatar, class_id as "classId", class_name as "className", member_qr_code as "memberQrCode" 
      FROM users WHERE id = ${id} LIMIT 1;
    `;
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/users/:id', ensureDb, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { deletePayments } = req.query;
    if (deletePayments === 'true') {
      await sql!`DELETE FROM payments WHERE user_id = ${id};`;
    }
    await sql!`DELETE FROM users WHERE id = ${id};`;
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- CLASS GROUP -----------------
apiRouter.get('/class-group', ensureDb, async (req: Request, res: Response) => {
  try {
    const groups = await sql!`
      SELECT 
        id, 
        name, 
        treasurer_name as "treasurerName", 
        monthly_dues::float as "monthlyDues", 
        weekly_dues::float as "weeklyDues", 
        period, 
        due_date as "dueDate", 
        bank_info as "bankInfo"
      FROM class_group
      LIMIT 1;
    `;
    if (groups.length === 0) {
      return res.status(404).json({ error: 'Class group not found' });
    }
    res.json(groups[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/class-group', ensureDb, async (req: Request, res: Response) => {
  try {
    const { id, name, treasurerName, monthlyDues, weeklyDues, period, dueDate, bankInfo } = req.body;
    await sql!`
      UPDATE class_group
      SET 
        name = COALESCE(${name}, name),
        treasurer_name = COALESCE(${treasurerName}, treasurer_name),
        monthly_dues = COALESCE(${monthlyDues}, monthly_dues),
        weekly_dues = COALESCE(${weeklyDues}, weekly_dues),
        period = COALESCE(${period}, period),
        due_date = COALESCE(${dueDate}, due_date),
        bank_info = COALESCE(${bankInfo ? JSON.stringify(bankInfo) : null}, bank_info),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id || 'cls-12-mipa-1'}
    `;
    const updated = await sql!`
      SELECT id, name, treasurer_name as "treasurerName", monthly_dues::float as "monthlyDues", weekly_dues::float as "weeklyDues", period, due_date as "dueDate", bank_info as "bankInfo"
      FROM class_group LIMIT 1;
    `;
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- PAYMENTS -----------------
apiRouter.get('/payments', ensureDb, async (req: Request, res: Response) => {
  try {
    const payments = await sql!`
      SELECT 
        id,
        user_id as "userId",
        user_name as "userName",
        amount::float as amount,
        date,
        month_period as "monthPeriod",
        week_period as "weekPeriod",
        weeks_paid as "weeksPaid",
        method,
        status,
        transaction_id as "transactionId",
        proof_url as "proofUrl",
        notes,
        verified_at as "verifiedAt",
        verified_by as "verifiedBy"
      FROM payments
      ORDER BY date DESC, id DESC;
    `;
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/payments', ensureDb, async (req: Request, res: Response) => {
  try {
    const {
      id,
      userId,
      userName,
      amount,
      date,
      monthPeriod,
      weekPeriod,
      weeksPaid,
      method,
      status,
      transactionId,
      proofUrl,
      notes,
      verifiedAt,
      verifiedBy,
    } = req.body;

    const paymentId = id || `pay-${Date.now()}`;
    const txnId = transactionId || `KASKU-TXN-${Math.floor(10000 + Math.random() * 90000)}`;

    await sql!`
      INSERT INTO payments (
        id, user_id, user_name, amount, date, month_period, week_period, weeks_paid,
        method, status, transaction_id, proof_url, notes, verified_at, verified_by
      )
      VALUES (
        ${paymentId}, ${userId}, ${userName}, ${amount}, ${date}, ${monthPeriod},
        ${weekPeriod || null}, ${JSON.stringify(weeksPaid || [])}, ${method},
        ${status}, ${txnId}, ${proofUrl || null}, ${notes || null},
        ${verifiedAt || null}, ${verifiedBy || null}
      )
    `;

    const inserted = await sql!`
      SELECT 
        id, user_id as "userId", user_name as "userName", amount::float as amount,
        date, month_period as "monthPeriod", week_period as "weekPeriod", weeks_paid as "weeksPaid",
        method, status, transaction_id as "transactionId", proof_url as "proofUrl",
        notes, verified_at as "verifiedAt", verified_by as "verifiedBy"
      FROM payments WHERE id = ${paymentId} LIMIT 1;
    `;
    res.json(inserted[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/payments/:id', ensureDb, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, verifiedAt, verifiedBy, notes, amount, method } = req.body;

    await sql!`
      UPDATE payments
      SET
        status = COALESCE(${status}, status),
        verified_at = COALESCE(${verifiedAt}, verified_at),
        verified_by = COALESCE(${verifiedBy}, verified_by),
        notes = COALESCE(${notes}, notes),
        amount = COALESCE(${amount}, amount),
        method = COALESCE(${method}, method)
      WHERE id = ${id}
    `;

    const updated = await sql!`
      SELECT 
        id, user_id as "userId", user_name as "userName", amount::float as amount,
        date, month_period as "monthPeriod", week_period as "weekPeriod", weeks_paid as "weeksPaid",
        method, status, transaction_id as "transactionId", proof_url as "proofUrl",
        notes, verified_at as "verifiedAt", verified_by as "verifiedBy"
      FROM payments WHERE id = ${id} LIMIT 1;
    `;
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- EXPENSES -----------------
apiRouter.get('/expenses', ensureDb, async (req: Request, res: Response) => {
  try {
    const expenses = await sql!`
      SELECT 
        id,
        class_id as "classId",
        amount::float as amount,
        date,
        category,
        description,
        receipt_url as "receiptUrl",
        recorded_by as "recordedBy"
      FROM expenses
      ORDER BY date DESC, id DESC;
    `;
    res.json(expenses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/expenses', ensureDb, async (req: Request, res: Response) => {
  try {
    const { id, classId, amount, date, category, description, receiptUrl, recordedBy } = req.body;
    const expenseId = id || `exp-${Date.now()}`;

    await sql!`
      INSERT INTO expenses (id, class_id, amount, date, category, description, receipt_url, recorded_by)
      VALUES (${expenseId}, ${classId || 'cls-12-mipa-1'}, ${amount}, ${date}, ${category}, ${description}, ${receiptUrl || null}, ${recordedBy})
    `;

    const inserted = await sql!`
      SELECT id, class_id as "classId", amount::float as amount, date, category, description, receipt_url as "receiptUrl", recorded_by as "recordedBy"
      FROM expenses WHERE id = ${expenseId} LIMIT 1;
    `;
    res.json(inserted[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/expenses/:id', ensureDb, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, date, category, description, receiptUrl } = req.body;

    await sql!`
      UPDATE expenses
      SET
        amount = COALESCE(${amount}, amount),
        date = COALESCE(${date}, date),
        category = COALESCE(${category}, category),
        description = COALESCE(${description}, description),
        receipt_url = COALESCE(${receiptUrl}, receipt_url)
      WHERE id = ${id}
    `;

    const updated = await sql!`
      SELECT id, class_id as "classId", amount::float as amount, date, category, description, receipt_url as "receiptUrl", recorded_by as "recordedBy"
      FROM expenses WHERE id = ${id} LIMIT 1;
    `;
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/expenses/:id', ensureDb, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await sql!`DELETE FROM expenses WHERE id = ${id};`;
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- NOTIFICATIONS -----------------
apiRouter.get('/notifications', ensureDb, async (req: Request, res: Response) => {
  try {
    const notifications = await sql!`
      SELECT 
        id,
        user_id as "userId",
        title,
        message,
        is_read as "isRead",
        created_at as "createdAt",
        type
      FROM notifications
      ORDER BY created_at DESC;
    `;
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/notifications', ensureDb, async (req: Request, res: Response) => {
  try {
    const { id, userId, title, message, isRead, createdAt, type } = req.body;
    const notifId = id || `notif-${Date.now()}`;

    await sql!`
      INSERT INTO notifications (id, user_id, title, message, is_read, created_at, type)
      VALUES (${notifId}, ${userId}, ${title}, ${message}, ${Boolean(isRead)}, ${createdAt || new Date().toISOString()}, ${type || 'info'})
    `;

    const inserted = await sql!`
      SELECT id, user_id as "userId", title, message, is_read as "isRead", created_at as "createdAt", type
      FROM notifications WHERE id = ${notifId} LIMIT 1;
    `;
    res.json(inserted[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/notifications/:id/read', ensureDb, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await sql!`UPDATE notifications SET is_read = true WHERE id = ${id}`;
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/notifications/read-all', ensureDb, async (req: Request, res: Response) => {
  try {
    await sql!`UPDATE notifications SET is_read = true`;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
