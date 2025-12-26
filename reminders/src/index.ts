import {
  handleCreateReminder,
  handleGetReminders,
  handleDeleteReminder
} from './routes/reminders';

import { handleScheduledReminders } from './scheduled/checkReminders';
import { withCors, handleOptions } from './utils/cors';

export interface Env {
  REMINDERS_KV: KVNamespace;
  DOCS_URL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    // ✅ Preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    let response: Response;

    if (url.pathname === '/api/reminders') {
      if (request.method === 'POST') {
        response = await handleCreateReminder(request, env, ctx);
      } else if (request.method === 'GET') {
        response = await handleGetReminders(request, env, ctx);
      } else {
        response = new Response('Method Not Allowed', { status: 405 });
      }
    } else if (
      url.pathname.startsWith('/api/reminders/') &&
      request.method === 'DELETE'
    ) {
      response = await handleDeleteReminder(request, env, ctx);
    } else {
      response = new Response('Reminders API', { status: 200 });
    }

    return withCors(response, origin);
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    await handleScheduledReminders();
  }
};
