import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function EditAppraisalPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  const [form, setForm] = useState({ vehicle_vin: '', customer_id: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/appraisals/${id}`);
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setForm({
          vehicle_vin: data.vehicle_vin || '',
          customer_id: data.customer_id || '',
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to load appraisal');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, API_BASE]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/appraisals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Appraisal updated');
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update appraisal');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Edit Appraisal</h2>
      <div>
        <label className="block mb-1">VIN</label>
        <input
          name="vehicle_vin"
          value={form.vehicle_vin}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
        />
      </div>
      <div>
        <label className="block mb-1">Customer ID</label>
        <input
          name="customer_id"
          value={form.customer_id}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-electricblue text-white px-4 py-2 rounded">
          Save
        </button>
        <button type="button" onClick={() => navigate(-1)} className="border px-4 py-2 rounded">
          Cancel
        </button>
      </div>
    </form>
  );
}
