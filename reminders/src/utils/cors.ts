import { createCors } from 'itty-cors';
import type { Env } from '../index';

// Export a function that takes env and returns configured CORS handlers
export function getCorsHandlers(env: Env) {
  // Use the secret from wrangler
  const docsUrl = env.DOCS_URL;
  
  // Always allow these origins for development
  const allowedOrigins = [
    docsUrl,                      // Your production docs URL from secret
    'http://localhost:3000',      // Local dev server
    'http://localhost:5173',      // Vite dev server
  ];

  return createCors({
    origins: allowedOrigins,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  });
}

// For backward compatibility, export default handlers too
export const { preflight, corsify } = createCors({
  origins: ['*'],  // Fallback
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
});