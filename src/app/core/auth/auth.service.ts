import { Injectable, computed, signal } from '@angular/core';

export interface AuthUser {
  name: string;
  username: string;
  email: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

const SESSION_KEY = 'salsinmiedo-session';
const USERS_KEY = 'salsinmiedo-users';
const adminUser: StoredUser = {
  name: 'Ismael Ramos',
  username: 'admin',
  email: 'ismael@gmail.com',
  password: 'admin123',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUser = signal<AuthUser | null>(this.readSession());
  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  login(username: string, password: string): boolean {
    const user = this.users().find(
      (candidate) =>
        candidate.username.toLowerCase() === username.trim().toLowerCase() &&
        candidate.password === password,
    );

    if (!user) {
      return false;
    }

    this.startSession(user);
    return true;
  }

  register(user: StoredUser): boolean {
    const users = this.users();
    const alreadyExists = users.some(
      (candidate) =>
        candidate.username.toLowerCase() === user.username.toLowerCase() ||
        candidate.email.toLowerCase() === user.email.toLowerCase(),
    );

    if (alreadyExists) {
      return false;
    }

    const updatedUsers = [...users, user];
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    this.startSession(user);
    return true;
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this.currentUser.set(null);
  }

  private startSession(user: AuthUser): void {
    const sessionUser: AuthUser = {
      name: user.name,
      username: user.username,
      email: user.email,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    this.currentUser.set(sessionUser);
  }

  private users(): StoredUser[] {
    const savedUsers = localStorage.getItem(USERS_KEY);

    if (!savedUsers) {
      return [adminUser];
    }

    try {
      return [adminUser, ...JSON.parse(savedUsers) as StoredUser[]];
    } catch {
      return [adminUser];
    }
  }

  private readSession(): AuthUser | null {
    const session = localStorage.getItem(SESSION_KEY);

    if (!session) {
      return null;
    }

    try {
      const user = JSON.parse(session) as AuthUser;
      if (
        user.username === 'admin' &&
        (user.name !== adminUser.name || user.email !== adminUser.email)
      ) {
        const migratedUser = { ...user, name: adminUser.name, email: adminUser.email };
        localStorage.setItem(SESSION_KEY, JSON.stringify(migratedUser));
        return migratedUser;
      }
      return user;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
