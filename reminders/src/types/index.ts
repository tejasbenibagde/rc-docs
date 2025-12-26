export interface Reminder {
	id: string;
	title: string;
	description: string;
	dueDate: string;
	email: string;
	sent: boolean;
	created: string;
}

export interface ReminderRequest {
	title: string;
	description?: string;
	dueDate: string;
	email: string;
}

export interface CreateReminderResponse {
	success: boolean;
	id: string;
	reminder: Reminder;
}

export interface ErrorResponse {
	error: string;
}

export interface DeleteResponse {
	success: boolean;
}
