import { ReminderService } from '../services/reminderService';
import { EmailService } from '../services/emailService';
import type { Env } from '../index';

export async function handleScheduledReminders(
	event: ScheduledEvent,
	env: Env,
	ctx: ExecutionContext
): Promise<void> {
	console.log('⏰ Checking for due reminders at', new Date().toISOString());

	try {
		const reminderService = new ReminderService(env);
		const emailService = new EmailService();
		const reminders = await reminderService.getAll();
		const now = new Date();
		let sentCount = 0;

		for (const reminder of reminders) {
			if (!reminder.sent) {
				const dueDate = new Date(reminder.dueDate);

				if (dueDate <= now) {
					console.log(
						`📨 Processing reminder: ${reminder.title} for ${reminder.email}`
					);

					const emailSent = await emailService.sendReminder(reminder, env);

					reminder.sent = true;
					await reminderService.update(reminder);

					if (emailSent) {
						console.log(`✅ Email sent for: ${reminder.title}`);
						sentCount++;
					} else {
						console.log(
							`⚠️  Marked as sent but email failed for: ${reminder.title}`
						);
					}
				}
			}
		}

		if (sentCount > 0) {
			console.log(`🎉 Sent ${sentCount} reminder(s)`);
		}
	} catch (error) {
		console.error('❌ Error in scheduled function:', error);
	}
}
