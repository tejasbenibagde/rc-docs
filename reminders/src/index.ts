import { getCorsHandlers } from './utils/cors';
import { handleCreateReminder, handleGetReminders, handleDeleteReminder } from './handlers';
import { handleScheduledReminders } from './scheduled/checkReminders';

export interface Env {
  REMINDERS_KV: KVNamespace;
  DOCS_URL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Get CORS handlers configured with your DOCS_URL secret
    const { preflight, corsify } = getCorsHandlers(env);

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return preflight(request);
    }

    // Route handlers
    if (url.pathname === '/api/reminders') {
      switch (request.method) {
        case 'POST':
          const createResponse = await handleCreateReminder(request, env, ctx);
          return corsify(createResponse);
          
        case 'GET':
          const getResponse = await handleGetReminders(request, env, ctx);
          return corsify(getResponse);
      }
    }

    if (url.pathname.startsWith('/api/reminders/') && request.method === 'DELETE') {
      const deleteResponse = await handleDeleteReminder(request, env, ctx);
      return corsify(deleteResponse);
    }

    // Default response
    return corsify(new Response('Reminders API', { status: 200 }));
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    await handleScheduledReminders(event, env, ctx);
  }
};