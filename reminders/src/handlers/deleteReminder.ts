import type { DeleteResponse } from '../types';
import { ReminderService } from '../services';
import { corsify } from '../utils/cors';
import type { Env } from '../index';

export async function handleDeleteReminder(
	request: Request,
	env: Env,
	ctx: ExecutionContext
): Promise<Response> {
	const url = new URL(request.url);
	const id = url.pathname.split('/').pop();

	if (!id) {
		return corsify(
			new Response(JSON.stringify({ error: 'Missing reminder ID' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			})
		);
	}

	const service = new ReminderService(env);
	await service.delete(id);

	return corsify(
		new Response(JSON.stringify({ success: true } as DeleteResponse), {
			headers: { 'Content-Type': 'application/json' },
		})
	);
}
