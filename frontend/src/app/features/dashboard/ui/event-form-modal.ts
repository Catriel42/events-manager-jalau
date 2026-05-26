import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Event } from '@shared/types/event.types';
import { EventsApi } from '@core/services/events-api';
import { TagsApi, Tag } from '@core/services/tags-api';
import { UploadService } from '@core/services/upload.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-event-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="onClose()"></div>

      <!-- Modal Content -->
      <div class="relative w-full max-w-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-white/5">
          <h2 class="text-xl font-bold text-[var(--text-primary)]">
            {{ event ? 'Edit Event' : 'New Event' }}
          </h2>
          <button (click)="onClose()" class="p-2 text-[var(--text-secondary)] hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          <!-- Banner Upload -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-[var(--text-secondary)]">Event Banner</label>
            <div 
              class="relative h-40 w-full bg-[var(--bg-tertiary)] border-2 border-dashed border-[var(--border-color)] rounded-2xl overflow-hidden group transition-all hover:border-blue-500/50"
              [class.border-blue-500]="isUploading()"
            >
              @if (form.get('banner_url')?.value) {
                <img [src]="form.get('banner_url')?.value" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button type="button" (click)="fileInput.click()" class="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-white text-sm font-medium">Change Image</button>
                </div>
              } @else {
                <div class="absolute inset-0 flex flex-col items-center justify-center cursor-pointer" (click)="fileInput.click()">
                  <svg class="w-10 h-10 text-[var(--text-muted)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-xs text-[var(--text-muted)]">Click to upload banner (Recommended 1200x400)</p>
                </div>
              }
              
              @if (isUploading()) {
                <div class="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p class="text-xs text-white">Uploading...</p>
                  </div>
                </div>
              }
            </div>
            <input #fileInput type="file" (change)="onFileSelected($event)" class="hidden" accept="image/*">
          </div>

          <!-- Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Title</label>
              <input formControlName="title" type="text" class="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" placeholder="Ex: Angular 19 Workshop">
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Event Type</label>
              <select formControlName="event_type" class="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all">
                <option value="virtual">Virtual</option>
                <option value="in_person">In Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
            <textarea formControlName="description" rows="3" class="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none" placeholder="Tell what this event is about..."></textarea>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Starts</label>
              <input formControlName="starts_at" type="datetime-local" class="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all">
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Ends</label>
              <input formControlName="ends_at" type="datetime-local" class="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all">
            </div>
          </div>

          <!-- Location / Link -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {{ form.get('event_type')?.value === 'virtual' ? 'Meeting Link' : 'Location' }}
            </label>
            <input [formControlName]="form.get('event_type')?.value === 'virtual' ? 'meeting_url' : 'location'" type="text" class="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" [placeholder]="form.get('event_type')?.value === 'virtual' ? 'https://zoom.us/...' : 'Room 302, Campus Jala'">
          </div>

          <!-- Capacity & Status -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Max Capacity</label>
              <input formControlName="capacity" type="number" class="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" placeholder="Ex: 50">
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</label>
              <select formControlName="status" class="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <!-- Tags -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Tags</label>
            <div class="flex flex-wrap gap-2 p-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl">
              @if (availableTags().length === 0) {
                <span class="text-sm text-[var(--text-muted)]">No tags available.</span>
              } @else {
                @for (tag of availableTags(); track tag.id) {
                  <label class="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                    <input 
                      type="checkbox" 
                      [checked]="hasTag(tag.id)" 
                      (change)="toggleTag(tag.id)"
                      class="rounded bg-black/20 border-white/20 text-blue-500 focus:ring-blue-500/50"
                    >
                    <span class="text-sm text-white font-medium">{{ tag.name }}</span>
                  </label>
                }
              }
            </div>
          </div>
        </form>

        <!-- Footer -->
        <div class="px-6 py-4 bg-white/5 border-t border-[var(--border-color)] flex items-center justify-end gap-3">
          <button (click)="onClose()" type="button" class="px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            [disabled]="form.invalid || isSaving() || isUploading()"
            (click)="onSubmit()"
            class="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            {{ isSaving() ? 'Saving...' : (event ? 'Save Changes' : 'Create Event') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
  `]
})
export class EventFormModal implements OnInit {
  @Input() event: Event | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private eventsApi = inject(EventsApi);
  private tagsApi = inject(TagsApi);
  private uploadService = inject(UploadService);

  form!: FormGroup;
  isSaving = signal(false);
  isUploading = signal(false);
  availableTags = signal<Tag[]>([]);

  ngOnInit() {
    this.initForm();
    this.loadTags();
    if (this.event) {
      this.patchForm();
    }
  }

  private loadTags() {
    this.tagsApi.getAllTags().subscribe({
      next: (tags) => this.availableTags.set(tags),
      error: (err) => console.error('Failed to load tags', err)
    });
  }

  private initForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      event_type: ['virtual', Validators.required],
      status: ['draft', Validators.required],
      starts_at: ['', Validators.required],
      ends_at: ['', Validators.required],
      location: [''],
      meeting_url: [''],
      capacity: [null, [Validators.min(1)]],
      banner_url: [''],
      tag_ids: [[]],
    });
  }

  private toLocalDatetimeLocal(dateString: string | Date): string {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private patchForm() {
    this.form.patchValue({
      ...this.event,
      starts_at: this.event?.starts_at ? this.toLocalDatetimeLocal(this.event.starts_at) : '',
      ends_at: this.event?.ends_at ? this.toLocalDatetimeLocal(this.event.ends_at) : '',
      tag_ids: this.event?.tags?.map(t => t.id) || [],
    });
  }

  hasTag(tagId: string): boolean {
    const ids: string[] = this.form.get('tag_ids')?.value || [];
    return ids.includes(tagId);
  }

  toggleTag(tagId: string) {
    const ids: string[] = this.form.get('tag_ids')?.value || [];
    if (ids.includes(tagId)) {
      this.form.patchValue({ tag_ids: ids.filter(id => id !== tagId) });
    } else {
      this.form.patchValue({ tag_ids: [...ids, tagId] });
    }
    this.form.get('tag_ids')?.markAsDirty();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading.set(true);
    this.uploadService.uploadImage(file).subscribe({
      next: (res) => {
        this.form.patchValue({ banner_url: res.url });
        this.isUploading.set(false);
      },
      error: () => this.isUploading.set(false)
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    const formValue = this.form.value;
    const data = {
      ...formValue,
      starts_at: formValue.starts_at ? new Date(formValue.starts_at).toISOString() : '',
      ends_at: formValue.ends_at ? new Date(formValue.ends_at).toISOString() : '',
    };

    const request = this.event 
      ? this.eventsApi.updateEvent(this.event.id, data)
      : this.eventsApi.createEvent(data);

    request.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.saved.emit();
        this.onClose();
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}
