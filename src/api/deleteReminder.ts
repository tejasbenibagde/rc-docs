// src/api/deleteReminder.ts

async function deleteReminder(baseUrl: string, id: string): Promise<{ success: boolean; message?: string }> {
  if (!baseUrl) {
    throw new Error('Base URL is required');
  }
  if (!id) {
    throw new Error('Reminder ID is required');
  }

  const res = await fetch(`${baseUrl}/api/reminders/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete reminder: ${errorText || res.statusText}`);
  }

  // Expecting JSON response like { success: true, message: "Reminder deleted successfully" }
  return res.json();
}

export default deleteReminder;
