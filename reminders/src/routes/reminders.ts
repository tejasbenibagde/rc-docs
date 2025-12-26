import type {
  Reminder,
  ReminderRequest,
  CreateReminderResponse,
  ErrorResponse,
  DeleteResponse,
} from '../types';
import type { Env } from '../index';

async function json(data: unknown, status = 200): Promise<Response> {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * CREATE REMINDER
 */
export async function handleCreateReminder(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  try {
    const data = (await request.json()) as ReminderRequest;

    if (!data.title || !data.dueDate || !data.email) {
      return json(
        { error: 'Missing required fields: title, dueDate, email' } as ErrorResponse,
        400
      );
    }

    const id = Date.now().toString();

    const reminder: Reminder = {
      id,
      title: data.title,
      description: data.description ?? '',
      dueDate: new Date(data.dueDate).toISOString(),
      email: data.email,
      sent: false,
      created: new Date().toISOString(),
    };

    try {
      await env.REMINDERS_KV.put(`reminder:${id}`, JSON.stringify(reminder));
    } catch (kvError) {
      console.error('KV put failed:', kvError);
      return json({ error: 'Failed to save reminder' } as ErrorResponse, 500);
    }

    return json(
      { success: true, id, reminder } as CreateReminderResponse,
      201
    );
  } catch (parseError) {
    console.error('Request body parse failed:', parseError);
    return json(
      { error: 'Invalid JSON or request body' } as ErrorResponse,
      400
    );
  }
}

/**
 * GET ALL REMINDERS
 */
export async function handleGetReminders(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  try {
    const list = await env.REMINDERS_KV.list();
    const reminders: Reminder[] = [];

    for (const key of list.keys) {
      if (!key.name.startsWith('reminder:')) continue;

      try {
        const reminder = await env.REMINDERS_KV.get<Reminder>(key.name, 'json');
        if (reminder) reminders.push(reminder);
      } catch (kvGetError) {
        console.error(`Failed to get KV key ${key.name}:`, kvGetError);
        // Optionally continue or return error here — continue to be resilient
      }
    }

    reminders.sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    return json(reminders);
  } catch (listError) {
    console.error('Failed to list reminders:', listError);
    return json(
      { error: 'Failed to fetch reminders' } as ErrorResponse,
      500
    );
  }
}

/**
 * DELETE REMINDER
 */
export async function handleDeleteReminder(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return json(
      { error: 'Missing reminder id' } as ErrorResponse,
      400
    );
  }

  try {
    await env.REMINDERS_KV.delete(`reminder:${id}`);
  } catch (kvDeleteError) {
    console.error(`Failed to delete reminder ${id}:`, kvDeleteError);
    return json(
      { error: 'Failed to delete reminder' } as ErrorResponse,
      500
    );
  }

  return json(
    { success: true, message: 'Reminder deleted successfully' } as DeleteResponse,
    200
  );
}
