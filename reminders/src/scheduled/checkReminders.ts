import { ReminderService } from '../services/reminderService';
import { EmailService } from '../services/emailService';

const service = new ReminderService();
const emailService = new EmailService();

export async function handleScheduledReminders() {
  console.log('⏰ Checking reminders');

  const reminders = await service.getAll();
  const now = new Date();

  for (const reminder of reminders) {
    if (!reminder.sent && new Date(reminder.dueDate) <= now) {
      await emailService.sendReminder(reminder);
      reminder.sent = true;
      await service.update(reminder);
      console.log(`✅ Sent: ${reminder.title}`);
    }
  }
}
