import type { Reminder } from '../types';

export class EmailService {
  async sendReminder(_reminder: Reminder): Promise<boolean> {
    return true;
  }
}
