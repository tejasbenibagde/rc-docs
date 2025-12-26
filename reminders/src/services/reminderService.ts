import type { Reminder, ReminderRequest } from '../types';
import type { Env } from '../index';

export class ReminderService {
	constructor(private env: Env) {}

	async create(data: ReminderRequest): Promise<Reminder> {
		const id = Date.now().toString();
		const reminder: Reminder = {
			id,
			title: data.title,
			description: data.description || '',
			dueDate: new Date(data.dueDate).toISOString(),
			email: data.email,
			sent: false,
			created: new Date().toISOString(),
		};

		await this.env.REMINDERS_KV.put(`reminder:${id}`, JSON.stringify(reminder));
		return reminder;
	}

	async getAll(): Promise<Reminder[]> {
		const list = await this.env.REMINDERS_KV.list();
		const reminders: Reminder[] = [];

		for (const key of list.keys) {
			const reminder = (await this.env.REMINDERS_KV.get(
				key.name,
				'json'
			)) as Reminder;
			if (reminder) reminders.push(reminder);
		}

		reminders.sort(
			(a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
		);
		return reminders;
	}

	async delete(id: string): Promise<void> {
		await this.env.REMINDERS_KV.delete(`reminder:${id}`);
	}

	async update(reminder: Reminder): Promise<void> {
		await this.env.REMINDERS_KV.put(
			`reminder:${reminder.id}`,
			JSON.stringify(reminder)
		);
	}

	async getById(id: string): Promise<Reminder | null> {
		return (await this.env.REMINDERS_KV.get(
			`reminder:${id}`,
			'json'
		)) as Reminder | null;
	}
}
