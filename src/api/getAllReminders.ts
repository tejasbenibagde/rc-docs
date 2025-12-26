import { Reminder } from '../types';

async function fetchReminders(baseUrl: string): Promise<Reminder[]> {
  if (!baseUrl) return [];

  const res = await fetch(`${baseUrl}/api/reminders`);

  if (!res.ok) {
    throw new Error('Failed to fetch reminders');
  }

  return res.json();
}

export default fetchReminders;
