import Avatar from './Avatar';
import HotnessChip from './HotnessChip';
import StageBadge from './StageBadge';
import ActionBar from './ActionBar';
import CustomerNameLink from './CustomerNameLink';

export default function CustomerTable({
  customers,
  onRowClick,
  selected = [],
  onSelect,
  onSelectAll,
}) {
  return (
    <div className="overflow-x-auto px-6">
      <table className="min-w-full border rounded-2xl shadow-xl bg-white">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="p-2">
              <input
                type="checkbox"
                checked={selected.length === customers.length && customers.length > 0}
                onChange={e => onSelectAll && onSelectAll(e.target.checked)}
                aria-label="Select all"
              />
            </th>
            <th className="p-2">Avatar</th>
            <th className="p-2">Name</th>
            <th className="p-2">Contact</th>
            <th className="p-2">Hotness</th>
            <th className="p-2">Stage</th>
            <th className="p-2">Vehicles</th>
            <th className="p-2">LTV</th>
            <th className="p-2">Next Action</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id} className="hover:bg-blue-50 border-b transition group cursor-pointer">
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selected.includes(c.id)}
                  onChange={e => onSelect && onSelect(c.id, e.target.checked)}
                  aria-label={`Select ${c.name}`}
                  onClick={e => e.stopPropagation()}
                />
              </td>
              <td className="p-2"><Avatar name={c.name} /></td>
              <td className="p-2 font-bold" onClick={() => onRowClick?.(c)}><CustomerNameLink id={c.id} name={c.name} /></td>
              <td className="p-2">{c.phone} <br /><span className="text-xs">{c.email}</span></td>
              <td className="p-2"><HotnessChip score={c.hotness} /></td>
              <td className="p-2"><StageBadge stage={c.stage} /></td>
              <td className="p-2">{c.vehicles?.length || 0}</td>
              <td className="p-2">${c.ltv?.toLocaleString() || 0}</td>
              <td className="p-2">{c.nextAction || <span className="text-xs text-gray-400">—</span>}</td>
              <td className="p-2"><ActionBar customer={c} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
