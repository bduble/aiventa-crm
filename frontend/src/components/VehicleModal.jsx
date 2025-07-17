import { useState, useEffect } from 'react';

export default function VehicleModal({ isOpen, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({
    stockNumber: '',
    vin: '',
    year: '',
    make: '',
    model: '',
    trim: '',
    price: '',
    mileage: '',
    color: '',
    condition: '',
    fuelType: '',
    drivetrain: '',
    videoUrls: '',
    historyReport: '',
    photos: []
  })

  useEffect(() => {
    if (initialData) {
      setForm({
        stockNumber: initialData.stockNumber || '',
        vin: initialData.vin || '',
        year: initialData.year || '',
        make: initialData.make || '',
        model: initialData.model || '',
        trim: initialData.trim || '',
        price: initialData.price || '',
        mileage: initialData.mileage || '',
        color: initialData.color || '',
        condition: initialData.condition || '',
        fuelType: initialData.fuelType || '',
        drivetrain: initialData.drivetrain || '',
        videoUrls: (initialData.videoUrls || []).join('\n'),
        historyReport: initialData.historyReport || '',
        photos: []
      })
    } else {
      setForm(f => ({ ...f, photos: [] }))
    }
  }, [initialData])

  if (!isOpen) return null

  const handleChange = e => {
    const { name, value, files } = e.target
    if (name === 'photos') {
      setForm(f => ({ ...f, photos: Array.from(files) }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded w-full max-w-2xl space-y-4">
        <h3 className="text-lg font-semibold">{initialData ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto pr-2">
          {[
            ['stockNumber','Stock #','text'],
            ['vin','VIN','text'],
            ['year','Year','number'],
            ['make','Make','text'],
            ['model','Model','text'],
            ['trim','Trim','text'],
            ['price','Price','number'],
            ['mileage','Mileage','number'],
            ['color','Color','text'],
            ['condition','Type','text'],
            ['fuelType','Fuel Type','text'],
            ['drivetrain','Drivetrain','text'],
          ].map(([name,label,type]) => (
            <div key={name} className="flex flex-col">
              <label className="text-sm mb-1">{label}</label>
              <input type={type} name={name} value={form[name]} onChange={handleChange} className="border rounded px-2 py-1" />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Video URLs (one per line)</label>
            <textarea name="videoUrls" value={form.videoUrls} onChange={handleChange} className="w-full border rounded px-2 py-1 h-24" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">History Report Link</label>
            <input name="historyReport" value={form.historyReport} onChange={handleChange} className="w-full border rounded px-2 py-1" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Photos</label>
            <input type="file" name="photos" multiple onChange={handleChange} className="w-full" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-3 py-2 bg-electricblue text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
