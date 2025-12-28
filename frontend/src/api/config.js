
const isDevelopment = import.meta.env.MODE === 'development';

/**
 * API Base URL
 * 
 * In development: 
 * Returns '' (empty string) so requests are relative (e.g. /api/users)
 * and handled by Vite's proxy in vite.config.js
 * 
 * In production:
 * Returns the full URL from environment variable VITE_API_URL
 * (e.g. https://skynaire.vercel.app/api for Vercel serverless functions)
 */
export const API_BASE_URL = isDevelopment
    ? 'http://localhost:5000'
    : (import.meta.env.VITE_API_URL || 'https://skynaire.vercel.app/api');

export const SOCKET_URL = isDevelopment
    ? 'http://localhost:5000'
    : (import.meta.env.VITE_API_URL || 'https://skynaire.vercel.app/api');

export const getMediaUrl = (path) => {
    if (!path) return '/images/default-avatar.png'; // Fallback
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;

    const baseUrl = isDevelopment
        ? 'http://localhost:5000'
        : (import.meta.env.VITE_API_URL || 'https://skynaire.vercel.app/api');

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
};
