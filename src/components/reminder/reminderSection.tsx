import fetchReminders from '@site/src/api/getAllReminders';
import deleteReminder from '@site/src/api/deleteReminder';
import createReminder from '@site/src/api/createReminder'; // import createReminder
import type { Reminder, ReminderRequest } from '@site/src/types';
import { useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './reminders.module.css';

/* ---------------- Reminder Card ---------------- */

function ReminderCard({
  reminder,
  onDelete,
}: {
  reminder: Reminder;
  onDelete: (id: string) => void;
}) {
  const isSent = reminder.sent;
  const isOverdue = new Date(reminder.dueDate) < new Date() && !isSent;

  return (
    <div
      className={`card ${isSent ? styles.cardSent : isOverdue ? styles.cardOverdue : ''
        }`}
    >
      <div className="card__body">
        <div className="margin-bottom--sm">
          <h3 className="margin-bottom--xs">{reminder.title}</h3>

          {isSent ? (
            <span className={`${styles.badge} ${styles.badgeSent}`}>✅ Sent</span>
          ) : isOverdue ? (
            <span className={`${styles.badge} ${styles.badgeOverdue}`}>
              ⏰ Overdue
            </span>
          ) : (
            <span className={`${styles.badge} ${styles.badgeUpcoming}`}>
              📅 Upcoming
            </span>
          )}
        </div>

        <p>{reminder.description || 'No description'}</p>

        <div className={styles.meta}>
          <span>📅 {new Date(reminder.dueDate).toLocaleString()}</span>
          <span>📧 {reminder.email}</span>
        </div>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => onDelete(reminder.id)}
          style={{
            marginTop: '1rem',
            padding: '0.4rem 0.8rem',
            borderRadius: '0.4rem',
            border: 'none',
            backgroundColor: '#e53e3e', // red
            color: 'white',
            cursor: 'pointer',
          }}
          aria-label={`Delete reminder ${reminder.title}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}


/* ReminderCard component unchanged */

export default function RemindersSection() {
  const { siteConfig } = useDocusaurusContext();
  const reminderApiUrl = siteConfig.customFields?.reminderApiUrl as string;

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'sent'>(
    'all'
  );
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Modal visibility state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // For Add Reminder form data & state
  const [newReminder, setNewReminder] = useState<ReminderRequest>({
    title: '',
    description: '',
    dueDate: '',
    email: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!reminderApiUrl) {
      console.error('Reminder API URL not configured');
      setLoading(false);
      return;
    }

    fetchReminders(reminderApiUrl)
      .then(setReminders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [reminderApiUrl]);

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this reminder?')) {
      return;
    }
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deleteReminder(reminderApiUrl, id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      alert('Error deleting reminder, please try again.');
      console.error(error);
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    if (!newReminder.title || !newReminder.dueDate || !newReminder.email) {
      setCreateError('Title, Due Date and Email are required.');
      return;
    }

    setCreating(true);
    try {
      const created = await createReminder(reminderApiUrl, newReminder);
      setReminders((prev) => [created.reminder, ...prev]);
      setNewReminder({ title: '', description: '', dueDate: '', email: '' });
      setIsModalOpen(false); // Close modal on success
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create reminder');
      console.error(error);
    } finally {
      setCreating(false);
    }
  }

  const filteredReminders = reminders.filter((r) => {
    const now = new Date();
    const due = new Date(r.dueDate);

    if (filter === 'sent') return r.sent;
    if (filter === 'overdue') return !r.sent && due < now;
    if (filter === 'upcoming') return !r.sent && due >= now;
    return true;
  });

  return (
    <section className="margin-vert--xl">
      <div className="container">
        <header className="text--center margin-bottom--lg">
          <h1>⏰ All Reminders</h1>
          <p className="text--secondary">View and manage all your scheduled reminders</p>
        </header>

        <div className={styles.filters} style={{ alignItems: 'center' }}>
          {(['all', 'upcoming', 'overdue', 'sent'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`${styles.filterButton} ${filter === f ? styles.filterButtonActive : ''
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}

          {/* Add Reminder Button */}
          <button
            className={styles.addButton}
            onClick={() => setIsModalOpen(true)}
            aria-label="Add new reminder"
          >
            + Add
          </button>
        </div>

        {loading && <p className="text--center">Loading reminders…</p>}

        {!loading && filteredReminders.length === 0 && (
          <p className="text--center text--secondary">No reminders found 🎉</p>
        )}

        {!loading && filteredReminders.length > 0 && (
          <div className="row">
            {filteredReminders.map((r) => (
              <div key={r.id} className="col col--4 margin-bottom--lg">
                <ReminderCard reminder={r} onDelete={handleDelete} />
                {deletingIds.has(r.id) && <p>Deleting...</p>}
              </div>
            ))}
          </div>
        )}

        {/* Modal Popup */}
        {isModalOpen && (
          <div
            className={styles.modalOverlay}
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.modalCloseBtn}
                aria-label="Close add reminder form"
              >
                &times;
              </button>

              <h2>Add New Reminder</h2>

              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Title"
                    value={newReminder.title}
                    onChange={(e) =>
                      setNewReminder((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <input
                    type="datetime-local"
                    placeholder="Due Date"
                    value={newReminder.dueDate}
                    onChange={(e) =>
                      setNewReminder((prev) => ({ ...prev, dueDate: e.target.value }))
                    }
                    required
                  />
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={newReminder.email}
                    onChange={(e) =>
                      setNewReminder((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <textarea
                    placeholder="Description (optional)"
                    value={newReminder.description}
                    onChange={(e) =>
                      setNewReminder((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>
                <button type="submit" disabled={creating}>
                  {creating ? 'Adding...' : 'Add Reminder'}
                </button>
                {createError && (
                  <p style={{ color: 'red', marginTop: '0.5rem' }}>{createError}</p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
