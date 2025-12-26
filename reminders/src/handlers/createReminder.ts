import type { ReminderRequest, ErrorResponse, CreateReminderResponse } from '../types';
import { ReminderService } from '../services';
import type { Env } from '../index';

export async function handleCreateReminder(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  try {
    const data = await request.json() as ReminderRequest;

    if (!data.title || !data.dueDate || !data.email) {
      // Return plain Response (corsify will be applied in main handler)
      return new Response(
        JSON.stringify({ error: 'Missing required fields' } as ErrorResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const service = new ReminderService(env);
    const reminder = await service.create(data);

    // Return plain Response
    return new Response(
      JSON.stringify({ 
        success: true, 
        id: reminder.id, 
        reminder 
      } as CreateReminderResponse),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON or data' } as ErrorResponse),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}