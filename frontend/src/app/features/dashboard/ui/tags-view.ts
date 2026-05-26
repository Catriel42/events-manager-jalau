import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TagsApi, Tag } from '@core/services/tags-api';
import { DashboardNav } from './dashboard-nav';

@Component({
  selector: 'app-tags-view',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardNav, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 my-8 md:my-12">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Tags Management</h1>
          <p class="text-[var(--text-secondary)] mt-1">Manage event categories and tags.</p>
        </div>
        <button
          (click)="openModal()"
          class="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 active:scale-95"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Tag
        </button>
      </div>

      <!-- Navigation Tabs -->
      <app-dashboard-nav></app-dashboard-nav>

      <!-- Tags Table Section -->
      <div class="bg-[var(--bg-glass)] backdrop-blur-2xl border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr class="border-b border-[var(--border-color)] bg-white/5">
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Name</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Slug</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border-color)]">
              @if (isLoading()) {
                @for (i of [1,2,3]; track i) {
                  <tr class="animate-pulse">
                    <td colspan="3" class="px-6 py-8 h-12 bg-white/5"></td>
                  </tr>
                }
              } @else {
                @for (tag of tags(); track tag.id) {
                  <tr class="hover:bg-white/5 transition-colors group">
                    <td class="px-6 py-4 text-[var(--text-primary)] font-medium">{{ tag.name }}</td>
                    <td class="px-6 py-4 text-[var(--text-secondary)] font-mono text-sm">{{ tag.slug }}</td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button (click)="editTag(tag)" class="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Edit">
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button (click)="deleteTag(tag)" class="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="px-6 py-12 text-center text-[var(--text-secondary)]">
                      No tags found.
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tag Modal -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" (click)="closeModal()"></div>
          <div class="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 class="text-xl font-bold text-[var(--text-primary)] mb-6">
              {{ editingTag() ? 'Edit Tag' : 'New Tag' }}
            </h3>
            <form (ngSubmit)="saveTag()">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name</label>
                  <input
                    type="text"
                    [(ngModel)]="tagName"
                    name="name"
                    required
                    class="w-full px-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">Slug (Optional)</label>
                  <input
                    type="text"
                    [(ngModel)]="tagSlug"
                    name="slug"
                    placeholder="Leave empty to auto-generate"
                    class="w-full px-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                </div>
              </div>
              <div class="mt-8 flex gap-3">
                <button type="button" (click)="closeModal()" class="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-[var(--text-primary)] font-medium rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" [disabled]="isSaving() || !tagName()" class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50">
                  {{ isSaving() ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class TagsView implements OnInit {
  private api = inject(TagsApi);

  tags = signal<Tag[]>([]);
  isLoading = signal(true);
  
  isModalOpen = signal(false);
  isSaving = signal(false);
  editingTag = signal<Tag | null>(null);
  
  tagName = signal('');
  tagSlug = signal('');

  ngOnInit() {
    this.loadTags();
  }

  loadTags() {
    this.isLoading.set(true);
    this.api.getAllTags().subscribe({
      next: (data) => {
        this.tags.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openModal() {
    this.editingTag.set(null);
    this.tagName.set('');
    this.tagSlug.set('');
    this.isModalOpen.set(true);
  }

  editTag(tag: Tag) {
    this.editingTag.set(tag);
    this.tagName.set(tag.name);
    this.tagSlug.set(tag.slug);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveTag() {
    if (!this.tagName().trim()) return;
    
    this.isSaving.set(true);
    const payload = {
      name: this.tagName(),
      ...(this.tagSlug() ? { slug: this.tagSlug() } : {})
    };

    const request = this.editingTag()
      ? this.api.updateTag(this.editingTag()!.id, payload)
      : this.api.createTag(payload);

    request.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
        this.loadTags();
      },
      error: () => {
        this.isSaving.set(false);
        alert('Error saving tag');
      }
    });
  }

  deleteTag(tag: Tag) {
    if (confirm(`Are you sure you want to delete tag "${tag.name}"?`)) {
      this.api.deleteTag(tag.id).subscribe(() => this.loadTags());
    }
  }
}
