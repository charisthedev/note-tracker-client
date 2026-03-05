import { IPaginationParams, IPaginationResult } from '@/types';
import type { NoteItem, NotePayload } from '@/types/note';

const API_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) {
        errorMessage = data.message;
      }
    } catch {
      // keep default fallback message when body isn't JSON
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function listNotes(query?: IPaginationParams) {
  const params = new URLSearchParams();
  if (query?.cursor) {
    params.set('cursor', query.cursor);
  }
  if (query?.limit) {
    params.set('limit', query.limit.toString());
  }
  return request<IPaginationResult<NoteItem>>(`/notes?${params.toString()}`);
}

export function createNote(payload: NotePayload) {
  return request<NoteItem>('/notes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateNote(id: string, payload: NotePayload) {
  return request<NoteItem>(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteNote(id: string) {
  return request<NoteItem>(`/notes/${id}`, {
    method: 'DELETE',
  });
}
