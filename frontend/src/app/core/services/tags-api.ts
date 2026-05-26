import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

@Injectable({ providedIn: 'root' })
export class TagsApi {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/tags`;

  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.baseUrl);
  }

  createTag(tag: Partial<Tag>): Observable<Tag> {
    return this.http.post<Tag>(this.baseUrl, tag);
  }

  updateTag(id: string, tag: Partial<Tag>): Observable<Tag> {
    return this.http.patch<Tag>(`${this.baseUrl}/${id}`, tag);
  }

  deleteTag(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
