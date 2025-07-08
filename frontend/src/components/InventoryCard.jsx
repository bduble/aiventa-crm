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
    stocknumber,
    trim,
    msrp,
    sellingprice,
    exterior_color,
    interior_color,
    mileage,
    link,
    image_link,
    additional_image_link,
    additional_image_link_1,
    additional_image_link_2,
    additional_image_link_3,
    additional_image_link_4,
    additional_image_link_5,
    additional_image_link_6,
    additional_image_link_7,
    additional_image_link_8,
    photos,
    active,
  } = vehicle

  // Compile all image sources
  const images =
    Array.isArray(photos) && photos.length
      ? photos
      : [
          image_link,
          additional_image_link,
          additional_image_link_1,
          additional_image_link_2,
          additional_image_link_3,
          additional_image_link_4,
          additional_image_link_5,
          additional_image_link_6,
          additional_image_link_7,
          additional_image_link_8,
        ]
        .filter(Boolean)
        .flatMap(link => link.split(','))
        .map(u => u.trim())

  const displayImages = images.length ? images : ['/images/placeholder-car.svg']
  const [current, setCurrent] = useState(0)
  const [open, setOpen] = useState(false)
  const prevImage = () => setCurrent(i => (i === 0 ? displayImages.length - 1 : i - 1))
  const nextImage = () => setCurrent(i => (i === displayImages.length - 1 ? 0 : i + 1))

  // Price formatting
  const msrpLabel = msrp ? `$${Number(msrp).toLocaleString()}` : null
  const saleLabel = sellingprice ? `$${Number(sellingprice).toLocaleString()}` : null

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={displayImages[current]}
          alt={`${year} ${make} ${model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onClick={() => setOpen(true)}
          onError={e => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/images/placeholder-car.svg'
          }}
        />
        {/* Price badges */}
        {saleLabel && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            SALE {saleLabel}
          </div>
        )}
        {msrpLabel && (
          <div className="absolute top-2 left-2 bg-white bg-opacity-80 px-2 py-1 rounded-full text-xs font-semibold text-gray-800">
            MSRP {msrpLabel}
          </div>
        )}
        {/* Carousel controls */}
        {displayImages.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-2 w-full flex justify-center space-x-2">
              {displayImages.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-colors duration-200 ${
                    idx === current ? 'bg-blue-600' : 'bg-white bg-opacity-60'
                  }`}  
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details Section */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 truncate">
            {year} {make} {model}
          </h3>
          <p className="mt-1 text-sm text-gray-600 truncate">Stock #: {stocknumber}</p>
          {mileage != null && (
            <p className="mt-1 flex items-center text-sm text-gray-600">
              <Tag className="w-4 h-4 mr-1 text-gray-500" /> {Number(mileage).toLocaleString()} mi
            </p>
          )}
          {trim && (
            <p className="mt-1 flex items-center text-sm text-gray-600">
              <Tag className="w-4 h-4 mr-1 text-gray-500" /> {trim}
            </p>
          )}
        </div>
        <div>
          {exterior_color && (
            <p className="flex items-center text-sm text-gray-600">
              <Palette className="w-4 h-4 mr-1 text-gray-500" /> Exterior: {exterior_color}
            </p>
          )}
          {interior_color && (
            <p className="mt-1 flex items-center text-sm text-gray-600">
              <Droplet className="w-4 h-4 mr-1 text-gray-500" /> Interior: {interior_color}
            </p>
          )}
          {saleLabel && (
            <p className="mt-2 text-sm font-semibold text-red-600">Now {saleLabel}</p>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t px-4 py-3 flex items-center justify-between bg-gray-50">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" /> View on Site
          </a>
        ) : <div />}
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(vehicle)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              Edit
            </button>
          )}
          {onToggle && (
            <button
              onClick={() => onToggle(vehicle)}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                active ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {active ? 'Disable' : 'Activate'}
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {open && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative max-w-[90%] max-h-[90%]">
            <img
              src={displayImages[current]}
              alt={`${year} ${make} ${model}`}
              className="w-full h-auto object-contain"
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
