"use client"

import type React from "react"

import fetchReminders from "@site/src/api/getAllReminders"
import deleteReminder from "@site/src/api/deleteReminder"
import createReminder from "@site/src/api/createReminder"
import type { Reminder, ReminderRequest } from "@site/src/types"
import { useEffect, useState, useMemo } from "react"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import styles from "./reminders.module.css"


function maskEmail(email: string) {
  const [name, domain] = email.split("@")
  if (!name || !domain) return "—"
  return `${name.slice(0, 2)}***@${domain}`
}

export default function RemindersSection() {
  const { siteConfig } = useDocusaurusContext()
  const reminderApiUrl = siteConfig.customFields?.reminderApiUrl as string

  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "upcoming" | "overdue" | "sent">("all")
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  // Modal visibility state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // For Add Reminder form data & state
  const [newReminder, setNewReminder] = useState<ReminderRequest>({
    title: "",
    description: "",
    dueDate: "",
    email: "",
  })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    if (!reminderApiUrl) {
      console.error("Reminder API URL not configured")
      setLoading(false)
      return
    }

    fetchReminders(reminderApiUrl)
      .then(setReminders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [reminderApiUrl])

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this reminder?")) {
      return
    }
    setDeletingIds((prev) => new Set(prev).add(id))
    try {
      await deleteReminder(reminderApiUrl, id)
      setReminders((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      alert("Error deleting reminder, please try again.")
      console.error(error)
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateError(null)

    if (!newReminder.title || !newReminder.dueDate || !newReminder.email) {
      setCreateError("Title, Due Date and Email are required.")
      return
    }

    setCreating(true)
    try {
      const created = await createReminder(reminderApiUrl, newReminder)
      setReminders((prev) => [created.reminder, ...prev])
      setNewReminder({ title: "", description: "", dueDate: "", email: "" })
      setIsModalOpen(false)
    } catch (error: any) {
      setCreateError(error.message || "Failed to create reminder")
      console.error(error)
    } finally {
      setCreating(false)
    }
  }

  const filteredReminders = useMemo(() => {
    const now = new Date()

    return reminders.filter((r) => {
      const due = new Date(r.dueDate)

      // Apply status filter
      let matchesFilter = true
      if (filter === "sent") matchesFilter = r.sent
      else if (filter === "overdue") matchesFilter = !r.sent && due < now
      else if (filter === "upcoming") matchesFilter = !r.sent && due >= now

      // Apply search query
      const matchesSearch =
        searchQuery === "" ||
        r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesFilter && matchesSearch
    })
  }, [reminders, filter, searchQuery])

  const getStatusInfo = (reminder: Reminder) => {
    const isSent = reminder.sent
    const isOverdue = new Date(reminder.dueDate) < new Date() && !isSent

    if (isSent) return { label: "Sent", className: styles.statusSent }
    if (isOverdue) return { label: "Overdue", className: styles.statusOverdue }
    return { label: "Upcoming", className: styles.statusUpcoming }
  }

  return (
    <section className="margin-vert--xl">
      <div className="container">
        <header className="text--center margin-bottom--lg">
          <h1>⏰ All Reminders</h1>
          <p className="text--secondary">View and manage all your scheduled reminders</p>
        </header>

        <div className={styles.toolbar}>
          <div className={styles.searchContainer}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search reminders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button className={styles.clearButton} onClick={() => setSearchQuery("")} aria-label="Clear search">
                ×
              </button>
            )}
          </div>

          <div className={styles.filterGroup}>
            {(["all", "upcoming", "overdue", "sent"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`${styles.filterButton} ${filter === f ? styles.filterButtonActive : ""}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <button className={styles.addButton} onClick={() => setIsModalOpen(true)} aria-label="Add new reminder">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add Reminder
          </button>
        </div>

        {loading && <p className={styles.emptyState}>Loading reminders…</p>}

        {!loading && filteredReminders.length === 0 && (
          <p className={styles.emptyState}>
            {searchQuery ? "No reminders match your search" : "No reminders found 🎉"}
          </p>
        )}

        {!loading && filteredReminders.length > 0 && (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Due Date</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReminders.map((reminder) => {
                  const status = getStatusInfo(reminder)
                  const isDeleting = deletingIds.has(reminder.id)

                  return (
                    <tr key={reminder.id} className={isDeleting ? styles.rowDeleting : ""}>
                      <td>
                        <span className={`${styles.statusBadge} ${status.className}`}>{status.label}</span>
                      </td>
                      <td className={styles.titleCell}>{reminder.title}</td>
                      <td className={styles.descriptionCell}>{reminder.description || "—"}</td>
                      <td className={styles.dateCell}>{new Date(reminder.dueDate).toLocaleString()}</td>
                      <td className={styles.emailCell}>
                        {reminder.email ? maskEmail(reminder.email) : "—"}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDelete(reminder.id)}
                          className={styles.deleteButton}
                          disabled={isDeleting}
                          aria-label={`Delete reminder ${reminder.title}`}
                        >
                          {isDeleting ? (
                            <svg className={styles.spinner} width="16" height="16" viewBox="0 0 16 16">
                              <circle
                                cx="8"
                                cy="8"
                                r="6"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                opacity="0.25"
                              />
                              <path
                                d="M8 2a6 6 0 0 1 6 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                              />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M2 4h12M5.5 4V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1m1.5 0v9a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Popup */}
        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.modalCloseBtn}
                aria-label="Close add reminder form"
              >
                ×
              </button>

              <h2>Add New Reminder</h2>

              <form onSubmit={handleCreate} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="title">Title *</label>
                  <input
                    id="title"
                    type="text"
                    placeholder="Enter reminder title"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="dueDate">Due Date *</label>
                  <input
                    id="dueDate"
                    type="datetime-local"
                    value={newReminder.dueDate}
                    onChange={(e) => setNewReminder((prev) => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="recipient@example.com"
                    value={newReminder.email}
                    onChange={(e) => setNewReminder((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    placeholder="Additional details (optional)"
                    value={newReminder.description}
                    onChange={(e) => setNewReminder((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelButton}>
                    Cancel
                  </button>
                  <button type="submit" disabled={creating} className={styles.submitButton}>
                    {creating ? "Adding..." : "Add Reminder"}
                  </button>
                </div>

                {createError && <p className={styles.errorMessage}>{createError}</p>}
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
