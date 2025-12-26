// src/api/createReminder.ts

import type { ReminderRequest, CreateReminderResponse } from '../types';

async function createReminder(
  baseUrl: string,
  data: ReminderRequest
): Promise<CreateReminderResponse> {
  if (!baseUrl) {
    throw new Error('Base URL is required');
  }

  // Basic validation could be done here, but API also does it, so optional.
  if (!data.title || !data.dueDate || !data.email) {
    throw new Error('Missing required fields: title, dueDate, or email');
  }

  const res = await fetch(`${baseUrl}/api/reminders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create reminder: ${errorText || res.statusText}`);
  }

  return res.json();
}

export default createReminder;
