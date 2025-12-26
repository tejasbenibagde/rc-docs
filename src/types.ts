// src/types.ts

type Reminder = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  email: string;
  sent: boolean;
  created: string;
};

// Data sent when creating a reminder (no id, sent, or created fields)
type ReminderRequest = {
  title: string;
  description?: string;
  dueDate: string;
  email: string;
};

// Expected response from creating a reminder
type CreateReminderResponse = {
  success: true;
  id: string;
  reminder: Reminder;
};

export type { Reminder, ReminderRequest, CreateReminderResponse };
