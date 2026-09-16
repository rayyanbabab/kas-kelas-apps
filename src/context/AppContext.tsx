import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { initialClassGroup, initialExpenses, initialNotifications, initialPayments, initialUsers } from '../data/mockData';
import { ClassGroup, Expense, Notification, Payment, PaymentMethod, PaymentStatus, Role, User } from '../types';
import { api, DbStatus } from '../services/api';

interface AppContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
  switchRole: (role: Role) => void;
  classGroup: ClassGroup;
  updateClassGroup: (updated: Partial<ClassGroup>) => Promise<void>;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updated: Partial<User>) => Promise<void>;
  deleteUser: (id: string, deletePaymentHistory?: boolean) => Promise<void>;
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'transactionId'>) => Payment;
  verifyPayment: (paymentId: string, status: PaymentStatus, notes?: string) => Promise<void>;
  markPaidManual: (userId: string, monthPeriod: string, amount: number, weekPeriod?: string) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, updated: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  notifications: Notification[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  sendReminder: (userId: string | 'all', title?: string, message?: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
  // Auth & Session
  isAuthenticated: boolean;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: { name: string; email?: string; phone?: string; password?: string; role?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  // Neon DB Status & Sync
  dbStatus: DbStatus;
  isLoading: boolean;
  refreshData: () => Promise<void>;
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
const SESSION_KEY = 'kasku_session_userId';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  // Restore session from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(SESSION_KEY));
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUserId = localStorage.getItem(SESSION_KEY);
    const savedUsers = localStorage.getItem(`${STORAGE_KEY}_users`);
    const userList: User[] = savedUsers ? JSON.parse(savedUsers) : initialUsers;
    if (savedUserId) {
      const found = userList.find((u) => u.id === savedUserId);
      if (found) return found;
    }
    // Not authenticated — return a placeholder, won't be used until login
    return userList[0];
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

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<DbStatus>({
    configured: false,
    connected: false,
    message: 'Memeriksa koneksi database Neon...',
  });

  // --- AUTH FUNCTIONS ---
  const login = useCallback(async (identifier: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    // Try backend auth first (when DB is connected)
    if (dbStatus.connected) {
      try {
        const result = await api.login(identifier, password);
        if (result.success && result.user) {
          const loggedUser = result.user;
          setCurrentUser(loggedUser);
          // Update user in state if not present
          setUsers((prev) => {
            const exists = prev.find((u) => u.id === loggedUser.id);
            return exists ? prev.map((u) => u.id === loggedUser.id ? loggedUser : u) : [...prev, loggedUser];
          });
          localStorage.setItem(SESSION_KEY, loggedUser.id);
          setIsAuthenticated(true);
          return { success: true };
        }
        return { success: false, message: result.message || 'Login gagal.' };
      } catch (err: any) {
        // Fall through to local auth
      }
    }

    // Local auth fallback
    const trimmed = identifier.trim().toLowerCase();
    const latestUsers: User[] = JSON.parse(localStorage.getItem(`${STORAGE_KEY}_users`) || 'null') || initialUsers;
    const found = latestUsers.find(
      (u) =>
        u.email?.toLowerCase() === trimmed ||
        u.name?.toLowerCase() === trimmed ||
        u.phone === trimmed
    );

    if (!found) {
      return { success: false, message: 'Pengguna tidak ditemukan. Periksa kembali email atau nama Anda.' };
    }

    // Check password if provided
    if (password && found.password && password.trim() !== found.password) {
      return { success: false, message: 'Password salah. Silakan coba lagi.' };
    }

    setCurrentUser(found);
    localStorage.setItem(SESSION_KEY, found.id);
    setIsAuthenticated(true);
    return { success: true };
  }, [dbStatus.connected]);

  const register = useCallback(async (userData: { name: string; email?: string; phone?: string; password?: string; role?: string }): Promise<{ success: boolean; message?: string }> => {
    // Check for duplicate
    const latestUsers: User[] = JSON.parse(localStorage.getItem(`${STORAGE_KEY}_users`) || 'null') || users;
    const emailTaken = userData.email && latestUsers.some((u) => u.email?.toLowerCase() === userData.email!.toLowerCase());
    if (emailTaken) {
      return { success: false, message: 'Email ini sudah terdaftar. Gunakan email lain atau masuk.' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email || '',
      phone: userData.phone || '',
      role: (userData.role as Role) || 'anggota',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=3b82f6&color=fff&size=150`,
      classId: 'cls-1',
      className: initialClassGroup.name,
      memberQrCode: `KASKU-${Date.now()}`,
      password: userData.password || '123456',
    };

    setUsers((prev) => [...prev, newUser]);

    if (dbStatus.connected) {
      try {
        await api.createUser(newUser);
      } catch (err) {
        console.warn('Failed to register in Neon, saved locally.');
      }
    }

    setCurrentUser(newUser);
    localStorage.setItem(SESSION_KEY, newUser.id);
    setIsAuthenticated(true);
    return { success: true };
  }, [dbStatus.connected, users]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    // Reset currentUser to first admin for safety
    setCurrentUser((prev) => {
      const allUsers: User[] = JSON.parse(localStorage.getItem(`${STORAGE_KEY}_users`) || 'null') || initialUsers;
      return allUsers.find((u) => u.role === 'admin') || allUsers[0] || prev;
    });
  }, []);

  // Fetch initial data from Neon DB
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await api.getStatus();
      setDbStatus(status);

      if (status.connected) {
        const [fetchedUsers, fetchedClass, fetchedPayments, fetchedExpenses, fetchedNotifications] = await Promise.all([
          api.getUsers(),
          api.getClassGroup(),
          api.getPayments(),
          api.getExpenses(),
          api.getNotifications(),
        ]);

        if (fetchedUsers && fetchedUsers.length > 0) {
          setUsers(fetchedUsers);
          // Keep current user updated
          setCurrentUser((prev) => fetchedUsers.find((u) => u.id === prev.id) || fetchedUsers[0]);
        }
        if (fetchedClass) setClassGroup(fetchedClass);
        if (fetchedPayments) setPayments(fetchedPayments);
        if (fetchedExpenses) setExpenses(fetchedExpenses);
        if (fetchedNotifications) setNotifications(fetchedNotifications);
      }
    } catch (err: any) {
      console.warn('Gagal memuat data dari Neon DB (beralih ke data lokal):', err);
      setDbStatus({
        configured: false,
        connected: false,
        message: 'Koneksi ke backend / Neon belum aktif. Menggunakan penyimpanan lokal.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Sync to localStorage as local cache / fallback
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

  const updateClassGroup = async (updated: Partial<ClassGroup>) => {
    setClassGroup((prev) => ({ ...prev, ...updated }));
    if (dbStatus.connected) {
      try {
        await api.updateClassGroup({ ...classGroup, ...updated });
      } catch (err) {
        console.error('Error updating class group in Neon:', err);
      }
    }
  };

  const addUser = async (newUser: Omit<User, 'id'>) => {
    const id = `usr-${Date.now()}`;
    const userWithId: User = { ...newUser, id };
    setUsers((prev) => [...prev, userWithId]);

    if (dbStatus.connected) {
      try {
        await api.createUser(userWithId);
      } catch (err) {
        console.error('Error adding user to Neon:', err);
      }
    }
  };

  const updateUser = async (id: string, updated: Partial<User>) => {
    const existingUser = users.find((u) => u.id === id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));

    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updated }));
    }

    if (dbStatus.connected) {
      try {
        await api.updateUser(id, updated);
      } catch (err) {
        console.error('Error updating user in Neon:', err);
      }
    }

    // If name is updated, sync payment history name & treasurer name
    if (updated.name && existingUser && updated.name !== existingUser.name) {
      setPayments((prev) =>
        prev.map((p) => (p.userId === id ? { ...p, userName: updated.name! } : p))
      );

      if (existingUser.role === 'bendahara' && classGroup.treasurerName === existingUser.name) {
        setClassGroup((prev) => ({ ...prev, treasurerName: updated.name! }));
        if (dbStatus.connected) {
          api.updateClassGroup({ treasurerName: updated.name! }).catch(console.error);
        }
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
      if (dbStatus.connected) {
        api.createNotification(newNotif).catch(console.error);
      }
    }
  };

  const deleteUser = async (id: string, deletePaymentHistory: boolean = false) => {
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

    if (dbStatus.connected) {
      try {
        await api.deleteUser(id, deletePaymentHistory);
      } catch (err) {
        console.error('Error deleting user from Neon:', err);
      }
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
    if (dbStatus.connected) {
      api.createNotification(newNotif).catch(console.error);
    }
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

    if (dbStatus.connected) {
      api.createPayment(newPayment).catch((err) => {
        console.error('Error saving payment to Neon:', err);
      });
    }

    // Create Notification
    const notifTitle =
      newPayment.status === 'lunas'
        ? 'Pembayaran Kas Berhasil ✅'
        : 'Pembayaran Menunggu Verifikasi 🟡';
    const notifMsg =
      newPayment.status === 'lunas'
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
    if (dbStatus.connected) {
      api.createNotification(newNotif).catch(console.error);
    }

    return newPayment;
  };

  const verifyPayment = async (paymentId: string, status: PaymentStatus, notes?: string) => {
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

    if (dbStatus.connected) {
      try {
        await api.updatePayment(paymentId, {
          status,
          notes,
          verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          verifiedBy: currentUser.name,
        });
      } catch (err) {
        console.error('Error verifying payment in Neon:', err);
      }
    }

    if (targetPayment) {
      const isApproved = status === 'lunas';
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: (targetPayment as Payment).userId,
        title: isApproved ? 'Pembayaran Diverifikasi LUNAS ✅' : 'Verifikasi Pembayaran Ditolak ❌',
        message: isApproved
          ? `Pembayaran kas periode ${(targetPayment as Payment).monthPeriod} kamu telah disetujui oleh Bendahara ${currentUser.name}.`
          : `Pembayaran kas periode ${(targetPayment as Payment).monthPeriod} ditolak. Catatan Bendahara: ${notes || 'Bukti kurang jelas'}.`,
        isRead: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: isApproved ? 'payment_success' : 'reminder',
      };
      setNotifications((prev) => [newNotif, ...prev]);
      if (dbStatus.connected) {
        api.createNotification(newNotif).catch(console.error);
      }
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
  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      recordedBy: currentUser.name,
    };
    setExpenses((prev) => [newExpense, ...prev]);

    if (dbStatus.connected) {
      try {
        await api.createExpense(newExpense);
      } catch (err) {
        console.error('Error adding expense to Neon:', err);
      }
    }
  };

  const updateExpense = async (id: string, updated: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );

    if (dbStatus.connected) {
      try {
        await api.updateExpense(id, updated);
      } catch (err) {
        console.error('Error updating expense in Neon:', err);
      }
    }
  };

  const deleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    if (dbStatus.connected) {
      try {
        await api.deleteExpense(id);
      } catch (err) {
        console.error('Error deleting expense in Neon:', err);
      }
    }
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));

    if (dbStatus.connected) {
      try {
        await api.markNotificationRead(id);
      } catch (err) {
        console.error('Error marking notif read in Neon:', err);
      }
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    if (dbStatus.connected) {
      try {
        await api.markAllNotificationsRead();
      } catch (err) {
        console.error('Error marking all notifs read in Neon:', err);
      }
    }
  };

  const sendReminder = async (targetUserId: string | 'all', title?: string, message?: string) => {
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

      if (dbStatus.connected) {
        for (const notif of newNotifs) {
          api.createNotification(notif).catch(console.error);
        }
      }
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

      if (dbStatus.connected) {
        api.createNotification(newNotif).catch(console.error);
      }
    }
  };

  // Reset Demo Data
  const resetDemoData = async () => {
    if (dbStatus.connected) {
      try {
        await api.resetDatabase();
        await refreshData();
        return;
      } catch (err) {
        console.error('Error resetting Neon database:', err);
      }
    }

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

  // Dynamic month parsing from classGroup.period (e.g. "Agustus 2026")
  const monthMap: Record<string, string> = {
    'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
    'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
    'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
  };
  const periodParts = classGroup.period.toLowerCase().split(' ');
  const periodMonthNum = periodParts[0] ? monthMap[periodParts[0]] : '';
  const periodYear = periodParts[1] || new Date().getFullYear().toString();
  const currentPeriodPrefix = periodMonthNum ? `${periodYear}-${periodMonthNum}` : new Date().toISOString().substring(0, 7);

  const totalExpenseThisMonth = expenses
    .filter((e) => e.date.startsWith(currentPeriodPrefix))
    .reduce((sum, e) => sum + e.amount, 0);

  const memberUsers = users.filter((u) => u.role !== 'admin');

  // Algorithm fix: count UNIQUE members instead of raw transaction rows
  const paidMemberIds = new Set(
    currentMonthPayments.map((p) => p.userId)
  );
  const paidMembersCount = paidMemberIds.size;

  const pendingVerificationIds = new Set(
    payments
      .filter((p) => p.monthPeriod === classGroup.period && p.status === 'menunggu')
      .map((p) => p.userId)
  );
  const pendingVerificationCount = pendingVerificationIds.size;

  const unpaidMembersCount = memberUsers.filter(
    (u) => !paidMemberIds.has(u.id) && !pendingVerificationIds.has(u.id)
  ).length;

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
        isAuthenticated,
        login,
        register,
        logout,
        dbStatus,
        isLoading,
        refreshData,
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
