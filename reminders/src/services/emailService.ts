import type { Reminder } from '../types';
import type { Env } from '../index';

export class EmailService {
	async sendReminder(reminder: Reminder, env: Env): Promise<boolean> {
		// For now, just return true
		// Later integrate with SendGrid/Resend
		return true;

		// Example SendGrid implementation:
		/*
    if (!env.SENDGRID_API_KEY) return false;
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: reminder.email }] }],
        from: { email: 'reminders@yourdomain.com', name: 'Reminder Service' },
        subject: `Reminder: ${reminder.title}`,
        content: [{
          type: 'text/plain',
          value: `Hi!\n\nThis is your reminder:\n\nTitle: ${reminder.title}\nDescription: ${reminder.description}\nDue: ${new Date(reminder.dueDate).toLocaleString()}`
        }]
      })
    });
    
    return response.ok;
    */
	}
}
