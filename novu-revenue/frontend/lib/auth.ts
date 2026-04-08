'use client';

export function saveToken(token: string) {
  localStorage.setItem('novu_token', token);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('novu_token');
}

export function clearToken() {
  localStorage.removeItem('novu_token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
