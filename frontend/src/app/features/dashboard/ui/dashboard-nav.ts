import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-nav',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="flex overflow-x-auto border-b border-[var(--border-color)] hide-scrollbar">
      <a 
        routerLink="/dashboard" 
        routerLinkActive="border-blue-500 text-blue-400 font-semibold"
        [routerLinkActiveOptions]="{exact: true}"
        class="px-6 py-3 border-b-2 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-sm transition-all duration-200 whitespace-nowrap"
      >
        Events
      </a>
      <a 
        routerLink="/dashboard/registrations" 
        routerLinkActive="border-blue-500 text-blue-400 font-semibold"
        class="px-6 py-3 border-b-2 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-sm transition-all duration-200 whitespace-nowrap"
      >
        Registrations
      </a>
      <a 
        routerLink="/dashboard/tags" 
        routerLinkActive="border-blue-500 text-blue-400 font-semibold"
        class="px-6 py-3 border-b-2 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-sm transition-all duration-200 whitespace-nowrap"
      >
        Tags
      </a>
      <a 
        routerLink="/dashboard/users" 
        routerLinkActive="border-blue-500 text-blue-400 font-semibold"
        class="px-6 py-3 border-b-2 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-sm transition-all duration-200 whitespace-nowrap"
      >
        Users
      </a>
    </div>
  `,
  styles: [`
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class DashboardNav {}
