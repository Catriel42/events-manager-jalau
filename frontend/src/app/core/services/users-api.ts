import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: 'admin' | 'user';
  provider: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  updateUserRole(id: string, role: 'admin' | 'user'): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, { role });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
