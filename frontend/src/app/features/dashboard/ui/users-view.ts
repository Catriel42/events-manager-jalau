import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersApi, User } from '@core/services/users-api';
import { DashboardNav } from './dashboard-nav';

@Component({
  selector: 'app-users-view',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardNav, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 my-8 md:my-12">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Users Management</h1>
          <p class="text-[var(--text-secondary)] mt-1">Manage user roles and access.</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <app-dashboard-nav></app-dashboard-nav>

      <!-- Users Table Section -->
      <div class="bg-[var(--bg-glass)] backdrop-blur-2xl border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr class="border-b border-[var(--border-color)] bg-white/5">
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">User</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Provider</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Role</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border-color)]">
              @if (isLoading()) {
                @for (i of [1,2,3,4]; track i) {
                  <tr class="animate-pulse">
                    <td colspan="4" class="px-6 py-8 h-16 bg-white/5"></td>
                  </tr>
                }
              } @else {
                @for (user of users(); track user.id) {
                  <tr class="hover:bg-white/5 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        @if (user.avatar_url) {
                          <img [src]="user.avatar_url" class="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0">
                        } @else {
                          <div class="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/20">
                            {{ getInitials(user.full_name) }}
                          </div>
                        }
                        <div class="max-w-[250px] truncate">
                          <p class="text-[var(--text-primary)] font-medium truncate">{{ user.full_name }}</p>
                          <p class="text-xs text-[var(--text-secondary)] truncate">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-2.5 py-1 text-xs font-medium bg-white/5 text-[var(--text-secondary)] rounded-md border border-white/10 capitalize">
                        {{ user.provider }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full"
                        [ngClass]="{
                          'bg-purple-500/10 text-purple-400 border border-purple-500/20': user.role === 'admin',
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20': user.role === 'user'
                        }"
                      >
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          (click)="toggleRole(user)" 
                          class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border"
                          [ngClass]="user.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20'"
                        >
                          {{ user.role === 'admin' ? 'Demote to User' : 'Promote to Admin' }}
                        </button>
                        <button (click)="deleteUser(user)" class="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-6 py-20 text-center text-[var(--text-secondary)]">
                      No users found.
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UsersView implements OnInit {
  private api = inject(UsersApi);

  users = signal<User[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.api.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  toggleRole(user: User) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (confirm(`Are you sure you want to change ${user.full_name}'s role to ${newRole}?`)) {
      this.api.updateUserRole(user.id, newRole).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to permanently delete user "${user.full_name}"?`)) {
      this.api.deleteUser(user.id).subscribe(() => this.loadUsers());
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
}
