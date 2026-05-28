import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-4 md:mx-auto my-6 md:my-12 p-6 md:p-10 bg-[var(--bg-glass)] border border-[var(--border-color)] rounded-2xl backdrop-blur-xl">
      <a routerLink="/" class="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6 md:mb-8">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </a>

      <h1 class="text-2xl md:text-4xl font-bold text-[var(--text-primary)] mb-6 md:mb-8">Terms of Service</h1>
      
      <div class="space-y-6 text-[var(--text-secondary)] leading-relaxed">
        <section>
          <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-3">1. Acceptance of Terms</h2>
          <p>By accessing and using Event Manager JalaU, you agree to comply with and be bound by these Terms of Service.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-3">2. User Account</h2>
          <p>You must use your institutional or personal account via Google OAuth to access certain features. You are responsible for maintaining the security of your authentication.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-3">3. Calendar Integration</h2>
          <p>The calendar sync feature is provided "as is". While we strive for accuracy, we are not responsible for any issues arising from third-party API service interruptions (Google).</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-3">4. Limitations of Liability</h2>
          <p>Event Manager JalaU shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service.</p>
        </section>

        <footer class="pt-8 border-t border-[var(--border-color)] mt-8">
          <p class="text-sm">Last updated: May 7, 2026</p>
        </footer>
      </div>
    </div>
  `
})
export class TermsComponent {}
