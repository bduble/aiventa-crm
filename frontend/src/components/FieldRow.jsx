import React from 'react'

export default function FieldRow({ label, value, editMode, onChange, type = 'text' }) {
  if (editMode) {
    if (type === 'checkbox') {
      return (
        <label className="flex items-center gap-2">
          <span className="font-medium">{label}</span>
          <input
            type="checkbox"
            className="border rounded"
            checked={!!value}
            onChange={e => onChange(e.target.checked)}
          />
        </label>
      )
    }
    return (
      <label className="flex flex-col">
        <span className="font-medium">{label}</span>
        <input
          type={type}
          className="border rounded px-2 py-1"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
        />
      </label>
    )
  }

  return (
    <div className="flex flex-col py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span>{type === 'checkbox' ? (value ? 'Yes' : 'No') : (value ?? '-')}</span>
    </div>
  )
}
