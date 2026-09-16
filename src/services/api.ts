import { ClassGroup, Expense, Notification, Payment, User } from '../types';

const API_BASE = '/api';

export interface DbStatus {
  configured: boolean;
  connected: boolean;
  message: string;
  version?: string;
}

export const api = {
  // Authentication
  async login(identifier: string, password?: string): Promise<{ success: boolean; user: User; token?: string; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login gagal.');
    }
    return data;
  },

  async register(userData: { name: string; email?: string; phone?: string; password?: string; role?: string }): Promise<{ success: boolean; user: User; token?: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registrasi gagal.');
    }
    return data;
  },

  // Status check
  async getStatus(): Promise<DbStatus> {
    const res = await fetch(`${API_BASE}/status`);
    return res.json();
  },

  // Database initialization/reset
  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
    return res.json();
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async createUser(user: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  },

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  async deleteUser(id: string, deletePayments = false): Promise<void> {
    const res = await fetch(`${API_BASE}/users/${id}?deletePayments=${deletePayments}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete user');
  },

  // Class Group
  async getClassGroup(): Promise<ClassGroup> {
    const res = await fetch(`${API_BASE}/class-group`);
    if (!res.ok) throw new Error('Failed to fetch class group');
    return res.json();
  },

  async updateClassGroup(classGroup: Partial<ClassGroup>): Promise<ClassGroup> {
    const res = await fetch(`${API_BASE}/class-group`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classGroup),
    });
    if (!res.ok) throw new Error('Failed to update class group');
    return res.json();
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    const res = await fetch(`${API_BASE}/payments`);
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  async createPayment(payment: Partial<Payment>): Promise<Payment> {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    if (!res.ok) throw new Error('Failed to create payment');
    return res.json();
  },

  async updatePayment(id: string, payment: Partial<Payment>): Promise<Payment> {
    const res = await fetch(`${API_BASE}/payments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    if (!res.ok) throw new Error('Failed to update payment');
    return res.json();
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    const res = await fetch(`${API_BASE}/expenses`);
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return res.json();
  },

  async createExpense(expense: Partial<Expense>): Promise<Expense> {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error('Failed to create expense');
    return res.json();
  },

  async updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error('Failed to update expense');
    return res.json();
  },

  async deleteExpense(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete expense');
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const res = await fetch(`${API_BASE}/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async createNotification(notif: Partial<Notification>): Promise<Notification> {
    const res = await fetch(`${API_BASE}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notif),
    });
    if (!res.ok) throw new Error('Failed to create notification');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to mark notification read');
  },

  async markAllNotificationsRead(): Promise<void> {
    const res = await fetch(`${API_BASE}/notifications/read-all`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to mark all notifications read');
  },
};
