import type { Reminder, ReminderRequest } from '../types';

const store = new Map<string, Reminder>();

export class ReminderService {
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

    store.set(id, reminder);
    return reminder;
  }

  async getAll(): Promise<Reminder[]> {
    return Array.from(store.values()).sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }

  async delete(id: string): Promise<void> {
    store.delete(id);
  }

  async update(reminder: Reminder): Promise<void> {
    store.set(reminder.id, reminder);
  }

  async getById(id: string): Promise<Reminder | null> {
    return store.get(id) ?? null;
  }
}
