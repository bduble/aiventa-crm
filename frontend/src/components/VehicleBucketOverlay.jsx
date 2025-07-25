import { useEffect, useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function VehicleBucketOverlay({ type, bucketKey, min, max, onClose }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMap, setEditMap] = useState({}); // { id: {field: value, ...} }
  const [editingRow, setEditingRow] = useState(null);
  const [previewVehicle, setPreviewVehicle] = useState(null);
  const [search, setSearch] = useState("");
  const modalRef = useRef(null);

  // Fetch vehicles on open
  useEffect(() => {
    setLoading(true);
    fetch(`/api/inventory/?type=${type}&days_min=${min}&days_max=${max}`)
      .then(res => res.json())
      .then(data => setVehicles(data))
      .finally(() => setLoading(false));
  }, [type, min, max]);

  // ESC to close, Enter to save if editing
  useEffect(() => {
    const handleKey = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && editingRow !== null) handleSave(editingRow);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [editingRow]);

  // Filtered vehicles
  const filteredVehicles = vehicles.filter(v =>
    !search ||
    v.make?.toLowerCase().includes(search.toLowerCase()) ||
    v.model?.toLowerCase().includes(search.toLowerCase()) ||
    v.stock_number?.toString().includes(search) ||
    v.vin?.toLowerCase().includes(search.toLowerCase())
  );

  // Handle field edit
  const handleEdit = (id, field, value) => {
    setEditMap(editMap => ({
      ...editMap,
      [id]: { ...editMap[id], [field]: value }
    }));
  };

  // Save single row
  const handleSave = async (id) => {
    const patch = editMap[id];
    if (!patch) return;
    toast.promise(
      fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      .then(async res => {
        if (!res.ok) throw new Error("Save failed");
        return res.json();
      })
      .then(() => {
        setVehicles(vehicles => vehicles.map(v => v.id === id ? { ...v, ...patch } : v));
        setEditMap(m => { const cp = {...m}; delete cp[id]; return cp; });
        setEditingRow(null);
        return "Saved!";
      }),
      {
        loading: "Saving...",
        success: "Changes saved!",
        error: (err) => err.message || "Save failed"
      }
    );
  };

  // Batch save all edits
  const handleBatchSave = async () => {
    const promises = Object.entries(editMap).map(([id, patch]) =>
      fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      .then(res => res.ok)
    );
    toast.promise(
      Promise.all(promises),
      {
        loading: "Saving all changes...",
        success: "All changes saved!",
        error: "Some saves failed"
      }
    );
    // Optimistically update UI:
    setVehicles(vehicles =>
      vehicles.map(v => editMap[v.id] ? { ...v, ...editMap[v.id] } : v)
    );
    setEditMap({});
    setEditingRow(null);
  };

  // Row click to preview
  const handleRowClick = (vehicle) => {
    if (editingRow !== vehicle.id) setPreviewVehicle(vehicle);
  };

  // Click outside to close detail preview
  useEffect(() => {
    if (!previewVehicle) return;
    const handle = (e) => {
      if (!modalRef.current?.contains(e.target)) setPreviewVehicle(null);
    };
    window.addEventListener("mousedown", handle);
    return () => window.removeEventListener("mousedown", handle);
  }, [previewVehicle]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <Toaster position="top-center" />
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full p-6 relative overflow-y-auto" style={{maxHeight:'92vh'}}>
        <button className="absolute top-3 right-3 text-2xl" onClick={onClose}>×</button>
        <h2 className="font-bold text-2xl mb-4">
          {type === "new" ? "New" : "Used"} – {bucketKey} Days In Stock
        </h2>
        {/* Search/Filter bar */}
        {vehicles.length > 20 && (
          <input
            className="w-full mb-4 px-3 py-2 border rounded-xl"
            placeholder="Search by Make, Model, Stock#, VIN..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        )}

        {loading ? (
          <div className="py-12 text-center">Loading vehicles...</div>
        ) : (
          <>
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th>Stock#</th>
                  <th>Year</th>
                  <th>Make</th>
                  <th>Model</th>
                  <th>VIN</th>
                  <th>Days In Stock</th>
                  <th>Price</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map(vehicle => (
                  <tr
                    key={vehicle.id}
                    className={`hover:bg-blue-50 cursor-pointer ${editingRow === vehicle.id ? "bg-yellow-50" : ""}`}
                    onClick={() => handleRowClick(vehicle)}
                  >
                    <td>{vehicle.stock_number}</td>
                    <td>{vehicle.year}</td>
                    <td>{vehicle.make}</td>
                    <td>{vehicle.model}</td>
                    <td>{vehicle.vin}</td>
                    <td>{vehicle.days_in_stock}</td>
                    <td onClick={e => { e.stopPropagation(); setEditingRow(vehicle.id); }}>
                      {editingRow === vehicle.id ? (
                        <input
                          type="number"
                          value={editMap[vehicle.id]?.sellingprice ?? vehicle.sellingprice}
                          onChange={e => handleEdit(vehicle.id, "sellingprice", e.target.value)}
                          className="border rounded p-1 w-20"
                          autoFocus
                        />
                      ) : (
                        <>${vehicle.sellingprice}</>
                      )}
                    </td>
                    <td>
                      {editingRow === vehicle.id ? (
                        <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={() => handleSave(vehicle.id)}>Save</button>
                      ) : (
                        <button className="text-blue-600 underline" onClick={e => { e.stopPropagation(); setEditingRow(vehicle.id); }}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Batch Save Button */}
            {Object.keys(editMap).length > 0 && (
              <button
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700"
                onClick={handleBatchSave}
              >
                Save All Changes
              </button>
            )}
          </>
        )}

        {/* Vehicle Preview Drawer */}
        {previewVehicle && (
          <div
            ref={modalRef}
            className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-white shadow-2xl p-6 z-60 transition"
            style={{maxWidth:400}}
          >
            <h3 className="text-lg font-bold mb-3">{previewVehicle.year} {previewVehicle.make} {previewVehicle.model}</h3>
            <div className="mb-2"><b>VIN:</b> {previewVehicle.vin}</div>
            <div className="mb-2"><b>Stock#:</b> {previewVehicle.stock_number}</div>
            <div className="mb-2"><b>Price:</b> ${previewVehicle.sellingprice}</div>
            <div className="mb-2"><b>Days In Stock:</b> {previewVehicle.days_in_stock}</div>
            {/* Add more fields and images as needed */}
            <button className="mt-4 px-4 py-2 bg-gray-300 rounded" onClick={() => setPreviewVehicle(null)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
