import type { ErrorResponse } from '../types';
import { ReminderService } from '../services';
import { corsify } from '../utils/cors';
import type { Env } from '../index';
export async function handleGetReminders(
	request: Request,
	env: Env,
	ctx: ExecutionContext
): Promise<Response> {
	try {
		const service = new ReminderService(env);
		const reminders = await service.getAll();

		return corsify(
			new Response(JSON.stringify(reminders), {
				headers: { 'Content-Type': 'application/json' },
			})
		);
	} catch (error) {
		return corsify(
			new Response(
				JSON.stringify({ error: 'Failed to fetch reminders' } as ErrorResponse),
				{ status: 500, headers: { 'Content-Type': 'application/json' } }
			)
		);
	}
}
