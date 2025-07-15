import React from 'react'

export default function LedgerEntry({ entry }) {
  const { created_at, activity_type, subject, note, staff_name } = entry
  const date = created_at ? new Date(created_at).toLocaleString() : ''
  const summary = subject || note
  return (
    <div className="border-b py-2">
      <div className="text-sm text-gray-500">
        {date}
        {activity_type ? ` • ${activity_type}` : ''}
        {staff_name ? ` – ${staff_name}` : ''}
      </div>
      {summary && <div>{summary}</div>}
    </div>
  )
}
