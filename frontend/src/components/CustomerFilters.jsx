import React from 'react';

export default function CustomerFilters({ search, setSearch, filters, onFilterClick }) {
  return (
    <div className="flex gap-2 flex-wrap px-6 py-2 bg-slate-50 border-b items-center">
      <input
        className="border px-3 py-2 rounded w-64"
        placeholder="Search by name, phone, email, tag…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {filters.map(f => (
        <button
          key={f}
          onClick={() => onFilterClick(f)}
          className="bg-slate-200 px-3 py-1 rounded-full text-xs font-medium hover:bg-slate-300"
        >
          {f}
        </button>
      ))}
    </div>
  );
}
