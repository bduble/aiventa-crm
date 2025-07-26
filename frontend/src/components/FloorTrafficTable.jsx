import { useState } from 'react';
import { Phone, MessageCircle, Mail, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { Progress } from './ui/progress'; // adjust path if needed
import { formatTime } from '../utils/formatDateTime';

export default function FloorTrafficTable({ rows = [], onEdit, onToggle }) {
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

  const sortedRows = Array.isArray(rows)
    ? [...rows].sort((a, b) => {
        const { key, direction } = sortConfig;
        const valA = a[key];
        const valB = b[key];
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (valA < valB) return direction === 'ascending' ? -1 : 1;
        if (valA > valB) return direction === 'ascending' ? 1 : -1;
        return 0;
      })
    : [];

  const headers = [
    { key: 'visit_time', label: 'Visit Time' },
    { key: 'time_on_lot', label: 'Time on Lot' },
    { key: 'time_out', label: 'Time Out' },
    { key: 'salesperson', label: 'Salesperson' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'demo', label: 'Demo' },
    { key: 'worksheet', label: 'Worksheet' },
    { key: 'customer_offer', label: 'Offer' },
    { key: 'sold', label: 'Sold' },
    { key: 'notes', label: 'Notes' }
  ];

  const centeredKeys = new Set(['demo', 'worksheet', 'customer_offer', 'sold', 'time_out']);

  const handleRowClick = id => {
    setAcknowledged(prev => new Set(prev).add(id));
  };

  const renderRow = row => {
    const visitTime = row.visit_time ? new Date(row.visit_time) : null;
    const hoursOnLot = visitTime
      ? (Date.now() - visitTime.getTime()) / (1000 * 60 * 60)
      : 0;
    const needsAttention = !row.time_out && hoursOnLot >= 4 && !acknowledged.has(row.id);

    let bgClass = row.sold
      ? 'bg-green-50'
      : row.time_out
      ? 'bg-yellow-50'
      : 'bg-red-50';

    const rowClasses = `hover:bg-blue-50 transition-colors cursor-pointer ${needsAttention ? 'animate-pulse' : ''} ${bgClass}`;

    return (
      <tr key={row.id} className={rowClasses} onClick={() => handleRowClick(row.id)}>
        {/* Visit Time */}
        <td className="p-2">{formatTime(row.visit_time)}</td>

        {/* Time on Lot Progress */}
        <td className="p-2">
          <div className="flex items-center gap-2">
            <Progress
              value={Math.min((hoursOnLot / 8) * 100, 100)}
              className="w-24 h-2"
            />
            <span className="text-xs font-medium">{Math.floor(hoursOnLot)}h</span>
          </div>
        </td>

        {/* Time Out */}
        <td className="p-2 text-center">
          {row.time_out ? (
            formatTime(row.time_out)
          ) : (
            <input
              type="checkbox"
              onChange={e => {
                e.stopPropagation();
                onToggle && onToggle(row.id, 'time_out', new Date().toISOString());
              }}
            />
          )}
        </td>

        {/* Salesperson */}
        <td className="p-2">{row.salesperson || ''}</td>

        {/* Customer Name */}
        <td className="p-2">{row.customer_name || ''}</td>

        {/* Vehicle */}
        <td className="p-2">{row.vehicle || ''}</td>

        {/* Demo, Worksheet, Offer, Sold */}
        {['demo', 'worksheet', 'customer_offer', 'sold'].map(field => (
          <td key={field} className="p-2 text-center">
            <input
              type="checkbox"
              checked={!!row[field]}
              onChange={e => {
                e.stopPropagation();
                onToggle && onToggle(row.id, field, e.target.checked);
              }}
              disabled={field === 'sold'}
            />
          </td>
        ))}

        {/* Notes */}
        <td className="p-2 whitespace-pre-line max-w-xs truncate">{row.notes || ''}</td>

        {/* Actions */}
        <td className="p-2 space-x-1">
          <button
            aria-label="Call"
            className="rounded-full p-2 hover:bg-gray-100 transition"
            onClick={e => {
              e.stopPropagation();
              if (row.phone) window.location.href = `tel:${row.phone}`;
            }}
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            aria-label="Text"
            className="rounded-full p-2 hover:bg-gray-100 transition"
            onClick={e => {
              e.stopPropagation();
              if (row.phone) window.location.href = `sms:${row.phone}`;
            }}
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            aria-label="Email"
            className="rounded-full p-2 hover:bg-gray-100 transition"
            onClick={e => {
              e.stopPropagation();
              if (row.email) window.location.href = `mailto:${row.email}`;
            }}
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            aria-label="Edit"
            className="rounded-full p-2 hover:bg-gray-100 transition"
            onClick={e => {
              e.stopPropagation();
              onEdit && onEdit(row);
            }}
          >
            <Pencil className="w-4 h-4" />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y">
        <thead className="sticky top-0 bg-electricblue text-white z-10">
          <tr>
            {headers.map(h => (
              <th
                key={h.key}
                className="p-2 text-left cursor-pointer select-none"
                onClick={() => toggleSort(h.key)}
              >
                {h.label}
                {sortConfig.key === h.key && (
                  sortConfig.direction === 'ascending'
                    ? <ChevronUp className="inline w-4 h-4 ml-1" />
                    : <ChevronDown className="inline w-4 h-4 ml-1" />
                )}
              </th>
            ))}
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
}
