import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';

  private tokenSignal = signal<string | null>(this.getTokenFromStorage());

  public isAuthenticated = computed(() => this.tokenSignal() !== null);

  public isAdmin = computed(() => {
    const token = this.tokenSignal();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'admin';
    } catch {
      return false;
    }
  });

  constructor() {}

  /**
   * Retrieves the current token string directly.
   * Useful for interceptors that need the string value.
   */
  public getToken(): string | null {
    return this.tokenSignal();
  }

  /**
   * Saves the token to localStorage and updates the internal state.
   */
  public setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.tokenSignal.set(token);
  }

  /**
   * Removes the token from localStorage and resets the internal state.
   */
  public removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.tokenSignal.set(null);
  }

  private getTokenFromStorage(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }
}
