import React, { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  X,
  DollarSign,
  Tag,
  Droplet,
  Palette,
  ExternalLink,
} from 'lucide-react'

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
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          {vehicle.stocknumber && (
            <p className="flex items-center gap-1">
              <Tag className="w-4 h-4" /> {vehicle.stocknumber}
            </p>
          )}
          {vehicle.msrp && (
            <p className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" /> MSRP:{' '}
              ${' '}
              {vehicle.msrp?.toLocaleString?.() || vehicle.msrp}
            </p>
          )}
          {vehicle.sellingprice && (
            <p className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" /> Selling Price:{' '}
              ${' '}
              {vehicle.sellingprice?.toLocaleString?.() || vehicle.sellingprice}
            </p>
          )}
          {vehicle.trim && (
            <p className="flex items-center gap-1">
              <Tag className="w-4 h-4" /> Trim: {vehicle.trim}
            </p>
          )}
          {vehicle.exteriorColor && (
            <p className="flex items-center gap-1">
              <Palette className="w-4 h-4" /> Exterior: {vehicle.exteriorColor}
            </p>
          )}
          {vehicle.interiorColor && (
            <p className="flex items-center gap-1">
              <Droplet className="w-4 h-4" /> Interior: {vehicle.interiorColor}
            </p>
          )}
        </div>
        {vehicle.link && (
          <a
            href={vehicle.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-electricblue hover:underline text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" /> View On Site
          </a>
        )}
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
