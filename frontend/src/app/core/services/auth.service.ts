import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { catchError, of, tap } from 'rxjs';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
}@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';

  private tokenSignal = signal<string | null>(this.getTokenFromStorage());

  public isAuthenticated = computed(() => this.tokenSignal() !== null);
  public currentUser = signal<UserProfile | null>(null);

  private http = inject(HttpClient);
  private router = inject(Router);

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

  constructor() {
    effect(() => {
      const token = this.tokenSignal();
      if (token && !this.currentUser()) {
        this.fetchProfile().subscribe();
      }
    });
  }

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

  /**
   * Fetches the current user profile from the backend.
   */
  public fetchProfile() {
    return this.http.get<UserProfile>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => this.currentUser.set(user)),
      catchError((error) => {
        console.error('Failed to fetch profile', error);
        this.removeToken();
        return of(null);
      })
    );
  }

  /**
   * Logs out the user and redirects to login.
   */
  public logout(): void {
    this.removeToken();
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
