export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export const apiUrl = (path: string): string => {
  if (!path.startsWith('/')) {
    return `${API_BASE_URL}/${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

export const apiFetch = (path: string, options?: RequestInit) => fetch(apiUrl(path), options);
