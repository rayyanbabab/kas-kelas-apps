import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialClassGroup, initialExpenses, initialNotifications, initialPayments, initialUsers } from '../data/mockData';
import { ClassGroup, Expense, Notification, Payment, PaymentMethod, PaymentStatus, Role, User } from '../types';

interface AppContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
  switchRole: (role: Role) => void;
  classGroup: ClassGroup;
  updateClassGroup: (updated: Partial<ClassGroup>) => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updated: Partial<User>) => void;
  deleteUser: (id: string, deletePaymentHistory?: boolean) => void;
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'transactionId'>) => Payment;
  verifyPayment: (paymentId: string, status: PaymentStatus, notes?: string) => void;
  markPaidManual: (userId: string, monthPeriod: string, amount: number, weekPeriod?: string) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updated: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  sendReminder: (userId: string | 'all', title?: string, message?: string) => void;
  resetDemoData: () => void;
  // Computed Stats
  totalBalance: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
  paidMembersCount: number;
  unpaidMembersCount: number;
  pendingVerificationCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'kasku_digital_state_v4';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    return users.find((u) => u.role === 'anggota') || users[0];
  });

  const [classGroup, setClassGroup] = useState<ClassGroup>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_class`);
    return saved ? JSON.parse(saved) : initialClassGroup;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_class`, JSON.stringify(classGroup));
  }, [classGroup]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  // Switch Active User
  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const switchRole = (role: Role) => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
    }
  };

  const updateClassGroup = (updated: Partial<ClassGroup>) => {
    setClassGroup((prev) => ({ ...prev, ...updated }));
  };

  const addUser = (newUser: Omit<User, 'id'>) => {
    const id = `usr-${Date.now()}`;
    const userWithId: User = { ...newUser, id };
    setUsers((prev) => [...prev, userWithId]);
  };

  const updateUser = (id: string, updated: Partial<User>) => {
    const existingUser = users.find((u) => u.id === id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
    
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updated }));
    }

    // If name is updated, sync payment history name & treasurer name
    if (updated.name && existingUser && updated.name !== existingUser.name) {
      setPayments((prev) =>
        prev.map((p) => (p.userId === id ? { ...p, userName: updated.name! } : p))
      );

      if (existingUser.role === 'bendahara' && classGroup.treasurerName === existingUser.name) {
        setClassGroup((prev) => ({ ...prev, treasurerName: updated.name! }));
      }

      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: id,
        title: 'Nama Berhasil Diperbarui ✏️',
        message: `Nama profil berhasil diubah dari "${existingUser.name}" menjadi "${updated.name}".`,
        isRead: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'verification',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const deleteUser = (id: string, deletePaymentHistory: boolean = false) => {
    const userToDelete = users.find((u) => u.id === id);
    if (!userToDelete) return;

    // Remove user
    const remainingUsers = users.filter((u) => u.id !== id);
    setUsers(remainingUsers);

    // If current active user is deleted, fallback to another user
    if (currentUser.id === id) {
      const fallbackUser = remainingUsers.find((u) => u.role === 'admin') || remainingUsers[0];
      if (fallbackUser) {
        setCurrentUser(fallbackUser);
      }
    }

    // Handle payments
    if (deletePaymentHistory) {
      setPayments((prev) => prev.filter((p) => p.userId !== id));
    }

    // Add audit notification
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: 'system',
      title: 'Anggota Dihapus 🗑️',
      message: `Akun anggota "${userToDelete.name}" (${userToDelete.email}) telah berhasil dihapus dari sistem kas kelas.`,
      isRead: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'verification',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Payment Handlers
  const addPayment = (paymentData: Omit<Payment, 'id' | 'transactionId'>): Payment => {
    const txnId = `KASKU-TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      transactionId: txnId,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Create Notification
    const notifTitle = newPayment.status === 'lunas' 
      ? 'Pembayaran Kas Berhasil ✅' 
      : 'Pembayaran Menunggu Verifikasi 🟡';
    const notifMsg = newPayment.status === 'lunas'
      ? `Pembayaran kas sebesar Rp${newPayment.amount.toLocaleString('id-ID')} untuk periode ${newPayment.monthPeriod} berhasil!`
      : `Bukti pembayaran kas ${newPayment.userName} sebesar Rp${newPayment.amount.toLocaleString('id-ID')} telah terkirim dan menunggu konfirmasi Bendahara.`;

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: newPayment.userId,
      title: notifTitle,
      message: notifMsg,
      isRead: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: newPayment.status === 'lunas' ? 'payment_success' : 'verification',
    };

    setNotifications((prev) => [newNotif, ...prev]);
    return newPayment;
  };

  const verifyPayment = (paymentId: string, status: PaymentStatus, notes?: string) => {
    let targetPayment: Payment | undefined;

    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId) {
          targetPayment = {
            ...p,
            status,
            notes: notes || p.notes,
            verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            verifiedBy: currentUser.name,
          };
          return targetPayment;
        }
        return p;
      })
    );

    if (targetPayment) {
      const isApproved = status === 'lunas';
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: targetPayment.userId,
        title: isApproved ? 'Pembayaran Diverifikasi LUNAS ✅' : 'Verifikasi Pembayaran Ditolak ❌',
        message: isApproved
          ? `Pembayaran kas periode ${targetPayment.monthPeriod} kamu telah disetujui oleh Bendahara ${currentUser.name}.`
          : `Pembayaran kas periode ${targetPayment.monthPeriod} ditolak. Catatan Bendahara: ${notes || 'Bukti kurang jelas'}.`,
        isRead: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: isApproved ? 'payment_success' : 'reminder',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const markPaidManual = (userId: string, monthPeriod: string, amount: number, weekPeriod?: string) => {
    const userObj = users.find((u) => u.id === userId);
    if (!userObj) return;

    addPayment({
      userId,
      userName: userObj.name,
      amount,
      date: new Date().toISOString().split('T')[0],
      monthPeriod,
      weekPeriod: weekPeriod || (amount === classGroup.weeklyDues ? 'Minggu 1' : '1 Bulan Penuh (Minggu 1 - 4)'),
      method: 'cash_manual',
      status: 'lunas',
      notes: `Setor tunai dicatat oleh Bendahara (${weekPeriod || 'Lunas'})`,
      verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      verifiedBy: currentUser.name,
    });
  };

  // Expense Handlers
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      recordedBy: currentUser.name,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const sendReminder = (targetUserId: string | 'all', title?: string, message?: string) => {
    const defaultTitle = 'Pengingat Uang Kas (Rp 6.000/mg) ⚠️';
    const defaultMsg = `Halo! Diingatkan untuk membayar kas kelas ${classGroup.period} (Rp 6.000 / minggu atau Rp 24.000 / bulan).`;

    if (targetUserId === 'all') {
      const unpaidMembers = users.filter((u) => {
        if (u.role === 'admin') return false;
        const p = payments.find(
          (pay) => pay.userId === u.id && pay.monthPeriod === classGroup.period && pay.status === 'lunas'
        );
        return !p;
      });

      const newNotifs: Notification[] = unpaidMembers.map((u) => ({
        id: `notif-${Date.now()}-${u.id}`,
        userId: u.id,
        title: title || defaultTitle,
        message: message || defaultMsg,
        isRead: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'reminder',
      }));

      setNotifications((prev) => [...newNotifs, ...prev]);
    } else {
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: targetUserId,
        title: title || defaultTitle,
        message: message || defaultMsg,
        isRead: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'reminder',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Reset Demo Data
  const resetDemoData = () => {
    setUsers(initialUsers);
    setCurrentUser(initialUsers[0]);
    setClassGroup(initialClassGroup);
    setPayments(initialPayments);
    setExpenses(initialExpenses);
    setNotifications(initialNotifications);
    localStorage.clear();
  };

  // Computed Financial Metrics
  const totalIncome = payments
    .filter((p) => p.status === 'lunas')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  const currentMonthPayments = payments.filter(
    (p) => p.monthPeriod === classGroup.period && p.status === 'lunas'
  );

  const totalIncomeThisMonth = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  const totalExpenseThisMonth = expenses
    .filter((e) => e.date.startsWith('2026-08'))
    .reduce((sum, e) => sum + e.amount, 0);

  const memberUsers = users.filter((u) => u.role !== 'admin');
  const paidMembersCount = currentMonthPayments.length;
  const pendingVerificationCount = payments.filter(
    (p) => p.monthPeriod === classGroup.period && p.status === 'menunggu'
  ).length;
  const unpaidMembersCount = Math.max(0, memberUsers.length - paidMembersCount - pendingVerificationCount);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        switchRole,
        classGroup,
        updateClassGroup,
        users,
        addUser,
        updateUser,
        deleteUser,
        payments,
        addPayment,
        verifyPayment,
        markPaidManual,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        sendReminder,
        resetDemoData,
        totalBalance,
        totalIncomeThisMonth,
        totalExpenseThisMonth,
        paidMembersCount,
        unpaidMembersCount,
        pendingVerificationCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
