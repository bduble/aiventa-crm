import { useState } from 'react';
import { Phone, MessageCircle, Mail, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { formatTime } from '../utils/formatDateTime';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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

  // sort rows
  const sorted = [...rows].sort((a, b) => {
    const { key, direction } = sortConfig;
    const valA = a[key];
    const valB = b[key];
    if (valA == null) return 1;
    if (valB == null) return -1;
    if (valA < valB) return direction === 'ascending' ? -1 : 1;
    if (valA > valB) return direction === 'ascending' ? 1 : -1;
    return 0;
  });

  // headers except time_on_lot, actions
  const headers = [
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
    const hoursOnLog = visitTime
      ? (Date.now() - visitTime.getTime()) / (1000 * 60 * 60)
      : 0;
    const needsAttention = !row.time_out && hoursOnLog >= 4 && !acknowledged.has(row.id);

    // determine row bg
    let bgClass = row.sold ? 'bg-green-50' : row.time_out ? 'bg-yellow-50' : 'bg-red-50';
    const rowClasses = `hover:bg-blue-50 transition-colors cursor-pointer ${needsAttention ? 'animate-pulse' : ''}`;

    return (
      <tr key={row.id} className={rowClasses} onClick={() => handleRowClick(row.id)}>
        {/* Visit Time */}
        <td className="p-2" data-label="Visit Time">{formatTime(row.visit_time)}</td>

        {/* Time on Lot Progress */}
        <td className="p-2" data-label="Time on Lot">
          <div className="flex items-center gap-2">
            <Progress
              value={Math.min((hoursOnLog / 8) * 100, 100)}
              className="w-24 h-2"
            />
            <span className="text-xs font-medium">{Math.floor(hoursOnLog)}h</span>
          </div>
        </td>

        {/* Other columns */}
        {headers.map(h => (
          <td
            key={h.key}
            className={`p-2 ${centeredKeys.has(h.key) ? 'text-center' : ''} ${h.key === 'notes' ? 'whitespace-pre-line max-w-xs truncate' : ''}`}
            data-label={h.label}
          >
            {h.key === 'time_out' ? (
              row.time_out ? formatTime(row.time_out) : (
                <input
                  type="checkbox"
                  onChange={e => {
                    e.stopPropagation();
                    onToggle?.(row.id, h.key, new Date().toISOString());
                  }}
                />
              )
            ) : ['demo','worksheet','customer_offer','sold'].includes(h.key) ? (
              <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: row[h.key] ? undefined : undefined }}>
                {row[h.key] ? h.label.charAt(0) : '–'}
              </span>
            ) : (
              String(row[h.key] ?? '')
            )}
          </td>
        ))}

        {/* Actions */}
        <td className="p-2 space-x-1" role="cell">
          <button onClick={e => (e.stopPropagation(), window.location.href = `tel:${row.phone}`)}>
            <Phone className="w-4 h-4" />
          </button>
          <button onClick={e => (e.stopPropagation(), window.location.href = `sms:${row.phone}`)}>
            <MessageCircle className="w-4 h-4" />
          </button>
          <button onClick={e => (e.stopPropagation(), window.location.href = `mailto:${row.email}`)}>
            <Mail className="w-4 h-4" />
          </button>
          <button onClick={e => (e.stopPropagation(), onEdit?.(row))}>
            <Pencil className="w-4 h-4" />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="sticky top-0 bg-electricblue text-white z-10">
              <tr>
                <th className="p-2 text-left cursor-pointer select-none" onClick={() => toggleSort('visit_time')}>
                  Visit Time
                  {sortConfig.key === 'visit_time' && (
                    sortConfig.direction === 'ascending'
                      ? <ChevronUp className="inline w-4 h-4 ml-1" />
                      : <ChevronDown className="inline w-4 h-4 ml-1" />
                  )}
                </th>
                <th className="p-2 text-left">Time on Lot</th>
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
            <tbody className="divide-y">
              {sorted.map(renderRow)}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
