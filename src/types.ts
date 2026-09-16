export type Role = 'anggota' | 'bendahara' | 'admin';

export type PaymentStatus = 'lunas' | 'menunggu' | 'belum_bayar' | 'terlambat';

export type PaymentMethod = 
  | 'qris' 
  | 'gopay' 
  | 'shopeepay' 
  | 'dana' 
  | 'transfer_bank' 
  | 'cash_manual';

export type ExpenseCategory = 
  | 'keperluan_kelas' 
  | 'kegiatan' 
  | 'perlengkapan' 
  | 'lainnya';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar: string;
  classId: string;
  className: string;
  memberQrCode: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  treasurerName: string;
  monthlyDues: number;
  weeklyDues: number;
  period: string;
  dueDate: number; // Day of month e.g. 10
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    qrisUrl?: string;
  };
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  date: string; // YYYY-MM-DD
  monthPeriod: string; // e.g., "Agustus 2026"
  weekPeriod?: string; // e.g. "Minggu 1", "Minggu 2", "Minggu 1-4", "1 Bulan Penuh"
  weeksPaid?: number[]; // [1, 2, 3, 4]
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  proofUrl?: string;
  notes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Expense {
  id: string;
  classId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  receiptUrl?: string;
  recordedBy: string;
}

export interface Notification {
  id: string;
  userId: string | 'all';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'reminder' | 'payment_success' | 'verification' | 'info';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}
