import React from "react";

// Example icons
const AppraisalIcon = () => <span title="Send to Appraisal">📈</span>;
const PicsIcon = () => <span title="Request Pics">📷</span>;
const KeysIcon = () => <span title="Missing Keys">🔑</span>;
const EditIcon = () => <span title="Edit">✏️</span>;
const LeadsIcon = () => <span title="Leads">👤</span>;

export default function InventoryTable({
  vehicles,
  onEdit,
  onBulkAction,
  onSelectVehicle,
  selectedIds,
  setSelectedIds,
}) {
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };
  const toggleAll = () => {
    if (selectedIds.length === vehicles.length) setSelectedIds([]);
    else setSelectedIds(vehicles.map((v) => v.id));
  };
  return (
    <table className="w-full table-auto text-sm">
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={selectedIds.length === vehicles.length}
              onChange={toggleAll}
            />
          </th>
          <th>Stock #</th>
          <th>Year</th>
          <th>Make</th>
          <th>Model</th>
          <th>Price</th>
          <th>Sell Next</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {vehicles.map((vehicle) => (
          <tr
            key={vehicle.id}
            className={selectedIds.includes(vehicle.id) ? "bg-blue-50" : ""}
          >
            <td>
              <input
                type="checkbox"
                checked={selectedIds.includes(vehicle.id)}
                onChange={() => toggleSelect(vehicle.id)}
              />
            </td>
            <td>{vehicle.stockNumber}</td>
            <td>{vehicle.year}</td>
            <td>{vehicle.make}</td>
            <td>{vehicle.model}</td>
            <td>${vehicle.price?.toLocaleString()}</td>
            <td>
              {vehicle.sellNextScore > 85 && (
                <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold mr-1">
                  🔥 Sell Next
                </span>
              )}
              <span className="text-gray-400 text-xs" title={`AI Score: ${vehicle.sellNextScore}`}>
                {vehicle.sellNextScore}
              </span>
            </td>
            <td>{vehicle.status}</td>
            <td className="flex gap-1">
              <button onClick={() => onSelectVehicle(vehicle)} className="text-blue-600 hover:underline" title="Recent Leads">
                <LeadsIcon />
              </button>
              <button onClick={() => onBulkAction("appraisal", [vehicle.id])} className="text-green-600" title="Send to Appraisal">
                <AppraisalIcon />
              </button>
              <button onClick={() => onBulkAction("requestPics", [vehicle.id])} className="text-yellow-600" title="Request Pics">
                <PicsIcon />
              </button>
              <button onClick={() => onBulkAction("missingKeys", [vehicle.id])} className="text-red-600" title="Mark Missing Keys">
                <KeysIcon />
              </button>
              <button onClick={() => onEdit(vehicle)} className="text-gray-700" title="Edit">
                <EditIcon />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
