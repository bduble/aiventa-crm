import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function InventoryCard({ vehicle, onEdit, onToggle }) {
  // Build images array from Supabase fields
  let images = [];

  if (Array.isArray(vehicle.photos) && vehicle.photos.length) {
    images = vehicle.photos;
  } else {
    images = [
      vehicle.imageLink,
      vehicle.additionalImageLink,
    ]
      .filter(Boolean)                  // drop null/undefined and empty strings
      .flatMap(link => link.split(',')) // split comma-separated lists
      .map(u => u.trim())               // trim whitespace
      .filter(Boolean);                 // remove leftover empties
  }

  // Fallback placeholder (SVG stored under /public/images)
  if (images.length === 0) {
    images = ['/images/placeholder-car.svg'];
  }

  const [current, setCurrent] = useState(0)
  const [open, setOpen]       = useState(false)

  const prevImage = () => setCurrent(i => (i === 0 ? images.length - 1 : i - 1))
  const nextImage = () => setCurrent(i => (i === images.length - 1 ? 0 : i + 1))

  const price =
    vehicle.internet_price ?? vehicle.selling_price ?? vehicle.price
  const mileage = vehicle.mileage
  const color = vehicle.color
  const status = vehicle.status ?? (vehicle.active ? 'In Stock' : 'Sold')

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      <div className="relative bg-gray-100">
        {images.length > 0 && (
          <img
            src={images[current]}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-48 object-cover cursor-pointer"
            onClick={() => setOpen(true)}
            onError={e => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/placeholder-car.svg';
            }}
          />
        )}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-colors duration-200 ${idx === current ? 'bg-blue-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-xl font-semibold">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        <div className="space-y-1 text-sm text-gray-500">
          {vehicle.stockNumber && (
            <p>
              <span className="font-semibold text-gray-700">Stock Number:</span>{' '}
              {vehicle.stockNumber}
            </p>
          )}
          {vehicle.year && (
            <p>
              <span className="font-semibold text-gray-700">Year:</span> {vehicle.year}
            </p>
          )}
          {vehicle.make && (
            <p>
              <span className="font-semibold text-gray-700">Make:</span> {vehicle.make}
            </p>
          )}
          {vehicle.model && (
            <p>
              <span className="font-semibold text-gray-700">Model:</span> {vehicle.model}
            </p>
          )}
          {vehicle.link && (
            <p>
              <span className="font-semibold text-gray-700">VDP:</span>{' '}
              <a
                href={vehicle.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {vehicle.link}
              </a>
            </p>
          )}
        </div>
        <p className="text-gray-600">${price?.toLocaleString?.() || price}</p>
        <p className="text-sm text-gray-500">Mileage: {mileage?.toLocaleString?.()}</p>
        <p className="text-sm text-gray-500">Color: {color}</p>
        <p className="text-sm text-gray-500">Status: {status}</p>
        {(onEdit || onToggle) && (
          <div className="flex justify-end gap-2 pt-2">
            {onEdit && (
              <button onClick={() => onEdit(vehicle)} className="px-2 py-1 bg-electricblue text-white rounded">
                Edit
              </button>
            )}
            {onToggle && (
              <button onClick={() => onToggle(vehicle)} className={`px-2 py-1 rounded ${vehicle.active ? 'bg-green-600 text-white' : 'bg-gray-300'}`}
              >
                {vehicle.active ? 'Disable' : 'Activate'}
              </button>
            )}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={images[current]}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className="max-h-[80vh] object-contain"
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/placeholder-car.svg';
              }}
            />
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <X size={20} />
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-whiteRounded-full shadow-lg hover:bg-gray-100"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
