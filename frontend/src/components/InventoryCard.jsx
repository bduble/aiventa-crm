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
  const {
    year,
    make,
    model,
    stockNumber,
    trim,
    msrp,
    sellingprice,
    exteriorColor,
    interiorColor,
    mileage,
    link,
    imageLink,
    additionalImageLink,
    additionalImageLink1,
    additionalImageLink2,
    additionalImageLink3,
    additionalImageLink4,
    additionalImageLink5,
    additionalImageLink6,
    additionalImageLink7,
    additionalImageLink8,
    active,
  } = vehicle

  // Gather all Supabase image columns first
  const imageFields = [
    imageLink,
    additionalImageLink,
    additionalImageLink1,
    additionalImageLink2,
    additionalImageLink3,
    additionalImageLink4,
    additionalImageLink5,
    additionalImageLink6,
    additionalImageLink7,
    additionalImageLink8,
  ]
  // Filter out empty and trim whitespace
  const images = imageFields.filter(url => typeof url === 'string' && url.trim())

  // If no images, use placeholder
  const displayImages = images.length > 0 ? images : ['/images/placeholder-car.svg']

  const [current, setCurrent] = useState(0)
  const [open, setOpen] = useState(false)
  const prevImage = () => setCurrent(i => (i === 0 ? displayImages.length - 1 : i - 1))
  const nextImage = () => setCurrent(i => (i === displayImages.length - 1 ? 0 : i + 1))

  // Format prices
  const formattedMSRP = msrp != null ? `$${Number(msrp).toLocaleString()}` : null
  const formattedSelling = sellingprice != null ? `$${Number(sellingprice).toLocaleString()}` : null

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* Image Carousel */}
      <div className="relative bg-gray-100">
        <img
          src={displayImages[current]}
          alt={`${year} ${make} ${model}`}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={() => setOpen(true)}
          onError={e => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/images/placeholder-car.svg'
          }}
        />
        {displayImages.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {displayImages.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-colors duration-200 ${
                    idx === current ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details */}
      <div className="p-4 space-y-2 text-sm text-gray-700">
        <h3 className="text-xl font-semibold">
          {year} {make} {model}
        </h3>
        {stockNumber && (
          <p className="flex items-center gap-1">
            <Tag className="w-4 h-4" /> Stock #: {stockNumber}
          </p>
        )}
        {formattedMSRP && (
          <p className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" /> MSRP: {formattedMSRP}
          </p>
        )}
        {formattedSelling && (
          <p className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" /> Selling Price: {formattedSelling}
          </p>
        )}
        {mileage != null && (
          <p className="flex items-center gap-1">
            <Tag className="w-4 h-4" /> Mileage: {Number(mileage).toLocaleString()} mi
          </p>
        )}
        {trim && (
          <p className="flex items-center gap-1">
            <Tag className="w-4 h-4" /> Trim: {trim}
          </p>
        )}
        {exteriorColor && (
          <p className="flex items-center gap-1">
            <Palette className="w-4 h-4" /> Exterior: {exteriorColor}
          </p>
        )}
        {interiorColor && (
          <p className="flex items-center gap-1">
            <Droplet className="w-4 h-4" /> Interior: {interiorColor}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex justify-between items-center">
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ExternalLink className="w-4 h-4" /> View On Site
          </a>
        )}
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(vehicle)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
            >
              Edit
            </button>
          )}
          {onToggle && (
            <button
              onClick={() => onToggle(vehicle)}
              className={`px-3 py-1 rounded-md text-sm transition ${
                active ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {active ? 'Disable' : 'Activate'}
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative max-w-full max-h-full">
            <img
              src={displayImages[current]}
              alt={`${year} ${make} ${model}`}
              className="max-h-[80vh] object-contain"
              onError={e => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/images/placeholder-car.svg'
              }}
            />
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
