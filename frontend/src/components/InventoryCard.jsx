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
  // Destructure fields from Supabase
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

  // Build images array
  let images = []
  if (Array.isArray(photos) && photos.length) {
    images = photos
  } else {
    images = [
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
  }
  if (images.length === 0) images = ['/images/placeholder-car.svg']

  const [current, setCurrent] = useState(0)
  const [open, setOpen] = useState(false)
  const prevImage = () => setCurrent(i => (i === 0 ? images.length - 1 : i - 1))
  const nextImage = () => setCurrent(i => (i === images.length - 1 ? 0 : i + 1))

  // Format prices
  const formattedMSRP = msrp != null ? `$${Number(msrp).toLocaleString()}` : null
  const formattedSelling =
    sellingprice != null ? `$${Number(sellingprice).toLocaleString()}` : null

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* IMAGE CAROUSEL */}
      <div className="relative bg-gray-100">
        <img
          src={images[current]}
          alt={`${year} ${make} ${model}`}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={() => setOpen(true)}
          onError={e => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/images/placeholder-car.svg'
          }}
        />
        {images.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-colors duration-200 ${
                    idx === current ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* DETAILS */}
      <div className="p-4 space-y-2">
        <h3 className="text-xl font-semibold">
          {year} {make} {model}
        </h3>
        <div className="space-y-1 text-sm text-gray-600">
          {stocknumber && (
            <p className="flex items-center gap-1"><Tag className="w-4 h-4" /> {stocknumber}</p>
          )}
          {formattedMSRP && (
            <p className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> MSRP: {formattedMSRP}</p>
          )}
          {formattedSelling && (
            <p className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> Selling: {formattedSelling}</p>
          )}
          {mileage != null && (
            <p className="flex items-center gap-1"><Tag className="w-4 h-4" /> Mileage: {Number(mileage).toLocaleString()} mi</p>
          )}
          {trim && (
            <p className="flex items-center gap-1"><Tag className="w-4 h-4" /> Trim: {trim}</p>
          )}
          {exterior_color && (
            <p className="flex items-center gap-1"><Palette className="w-4 h-4" /> Exterior: {exterior_color}</p>
          )}
          {interior_color && (
            <p className="flex items-center gap-1"><Droplet className="w-4 h-4" /> Interior: {interior_color}</p>
          )}
        </div>

        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-electricblue hover:underline text-sm font-medium">
            <ExternalLink className="w-4 h-4" /> View On Site
          </a>
        )}

        {(onEdit || onToggle) && (
          <div className="flex justify-end gap-2 pt-2">
            {onEdit && <button onClick={() => onEdit(vehicle)} className="px-2 py-1 bg-electricblue text-white rounded">Edit</button>}
            {onToggle && <button onClick={() => onToggle(vehicle)} className={`px-2 py-1 rounded ${active ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>{active ? 'Disable' : 'Activate'}</button>}
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative max-w-full max-h-full">
            <img
              src={images[current]}
              alt={`${year} ${make} ${model}`}
              className="max-h-[80vh] object-contain"
              onError={e => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/images/placeholder-car.svg'
              }}
            />
            <button onClick={() => setOpen(false)} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
              <X size={20} />
            </button>
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"><ChevronLeft size={24}/></button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"><ChevronRight size={24}/></button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
