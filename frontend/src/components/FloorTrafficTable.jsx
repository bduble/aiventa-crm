import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, Pencil } from 'lucide-react';
export default function FloorTrafficTable({ rows, onEdit, onToggle }) {
  const [sortConfig, setSortConfig] = useState({ key: 'visit_time', direction: 'ascending' });
  const [acknowledged, setAcknowledged] = useState(new Set());

  const toggleSort = key => {
    setSortConfig(prev => {
      if (prev.key === key) {
        const direction = prev.direction === 'ascending' ? 'descending' : 'ascending';
        return { key, direction };
      }
      return { key, direction: 'ascending' };
    });
  };

  const sorted = [...rows].sort((a, b) => {
    const { key, direction } = sortConfig;
    const valA = a[key];
    const valB = b[key];
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    if (valA < valB) return direction === 'ascending' ? -1 : 1;
    if (valA > valB) return direction === 'ascending' ? 1 : -1;
    return 0;
  });

  const headers = [
    { key: 'visit_time', label: 'Visit Time' },
    { key: 'time_out', label: 'Time Out' },
    { key: 'salesperson', label: 'Salesperson' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'demo', label: 'Demo' },
    { key: 'worksheet', label: 'Worksheet' },
    { key: 'customer_offer', label: 'Customer Offer' },
    { key: 'sold', label: 'Sold' },
    { key: 'notes', label: 'Notes' },
    { key: 'phone', label: 'Phone' }
  ];

  const handleRowClick = id => {
    setAcknowledged(prev => new Set(prev).add(id));
  };

  const renderRow = row => {
    const isUnresponded = !row.last_response_time && !acknowledged.has(row.id);
    let rowClasses = 'flex flex-col sm:table-row';
    if (isUnresponded) rowClasses += ' animate-pulse';
    if (row.sold) rowClasses += ' bg-green-100';
    else if (row.time_out) rowClasses += ' bg-yellow-100';
    else rowClasses += ' bg-red-100';
    return (
      <tr key={row.id} className={rowClasses} role="row" onClick={() => handleRowClick(row.id)}>
        {headers.map(h => (
          <td key={h.key} className="p-2" role="cell" data-label={h.label}>
            {h.key === 'visit_time' ? (
              new Date(row[h.key]).toLocaleTimeString()
            ) : h.key === 'time_out' ? (
              row[h.key] ? (
                new Date(row[h.key]).toLocaleTimeString()
              ) : (
                <input
                  type="checkbox"
                  onChange={e => {
                    e.stopPropagation();
                    onToggle && onToggle(row.id, h.key, new Date().toISOString());
                  }}
                />
              )
            ) : h.key === 'demo' || h.key === 'worksheet' || h.key === 'customer_offer' || h.key === 'sold' ? (
              <input
                type="checkbox"
                checked={Boolean(row[h.key])}
                onChange={e => {
                  e.stopPropagation();
                  onToggle && onToggle(row.id, h.key, e.target.checked);
                }}
              />
            ) : (
              String(row[h.key] ?? '')
            )}
          </td>
        ))}
        <td className="p-2 space-x-1" role="cell">
          <button
            aria-label={`Call ${row.customer_name}`}
            className="rounded-full p-2 hover:bg-gray-100 transition"
            onClick={e => {
              e.stopPropagation();
              window.location.href = `tel:${row.phone ?? ''}`;
            }}
          >
            <Phone className="h-4 w-4" />
          </button>
          <button
            aria-label={`Text ${row.customer_name}`}
            className="rounded-full p-2 hover:bg-gray-100 transition"
            onClick={e => {
              e.stopPropagation();
              window.location.href = `sms:${row.phone ?? ''}`;
            }}
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <button
            aria-label={`Email ${row.customer_name}`}
            className="rounded-full p-2 hover:bg-gray-100 transition"
            onClick={e => {
              e.stopPropagation();
              window.location.href = `mailto:${row.email ?? ''}`;
            }}
          >
            <Mail className="h-4 w-4" />
          </button>
          <button
            aria-label="Edit"
            className="rounded-full p-2 hover:bg-gray-100 transition"
            onClick={e => {
              e.stopPropagation();
              onEdit && onEdit(row);
            }}
          >
            <Pencil className="h-4 w-4" />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full" role="table">
        <thead>
          <tr role="row" className="bg-electricblue text-white">
            {headers.map(h => (
              <th
                key={h.key}
                role="columnheader"
                aria-sort={sortConfig.key === h.key ? sortConfig.direction : 'none'}
                className="p-2 text-left cursor-pointer select-none"
                onClick={() => toggleSort(h.key)}
              >
                {h.label}
              </th>
            ))}
            <th role="columnheader" className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y" role="rowgroup">
          {sorted.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
}
