import { ClassGroup, Expense, Notification, Payment, User } from '../types';

export const initialClassGroup: ClassGroup = {
  id: 'cls-1',
  name: 'Kas Kelas / Organisasi',
  treasurerName: 'Belum Ditentukan',
  weeklyDues: 6000,
  monthlyDues: 24000,
  period: 'September 2026',
  dueDate: 10,
  bankInfo: {
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '8820491028',
    accountName: 'Kas Kelas',
    qrisUrl: '',
  },
};

export const initialUsers: User[] = [
  {
    id: 'usr-admin',
    name: 'Administrator',
    email: 'admin@kasku.id',
    phone: '081234567890',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    classId: 'cls-1',
    className: 'Kas Kelas / Organisasi',
    memberQrCode: 'KASKU-ADMIN-001',
    password: 'admin123',
  },
];

export const initialPayments: Payment[] = [];

export const initialExpenses: Expense[] = [];

export const initialNotifications: Notification[] = [
  {
    id: 'notif-welcome',
    userId: 'usr-admin',
    title: 'Selamat Datang di KasKu Digital 🎉',
    message: 'Database telah dibersihkan. Anda dapat mulai menambahkan anggota kelas dan mengatur kas.',
    isRead: false,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    type: 'info',
  },
];
