import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  DollarSign,
  Tag,
  Droplet,
  Palette,
  ExternalLink,
} from "lucide-react";

export default function InventoryCard({ vehicle, onEdit, onToggle }) {
  const {
    year,
    make,
    model,
    type,
    stockNumber,
    trim,
    msrp,
    sellingprice, // your selling price
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
    exteriorColor,
    interiorColor,
    inventoryType,
    active,
  } = vehicle;

  // collect every image field (camelCase keys)
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
  ];

  // flatten comma-separated URLs, trim, drop falsy
  const images = imageFields
    .filter((u) => typeof u === "string" && u.trim())
    .flatMap((u) => u.split(","))
    .map((u) => u.trim());

  const displayImages = images.length
    ? images
    : ["/images/placeholder-car.svg"];

  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const prevImage = () =>
    setCurrent((i) => (i === 0 ? displayImages.length - 1 : i - 1));
  const nextImage = () =>
    setCurrent((i) => (i === displayImages.length - 1 ? 0 : i + 1));

  // format money
  const formattedMSRP =
    msrp != null ? `$${Number(msrp).toLocaleString()}` : null;
  const formattedPrice =
    sellingprice != null ? `$${Number(sellingprice).toLocaleString()}` : null;

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 bg-white dark:bg-gray-900">
      {/* IMAGE CAROUSEL */}
      <div className="relative bg-gray-100 dark:bg-gray-700">
        <img
          src={displayImages[current]}
          alt={`${year} ${make} ${model}`}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={() => setOpen(true)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/placeholder-car.svg";
          }}
        />

        {displayImages.length > 1 && (
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
              {displayImages.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-colors duration-200 ${
                    idx === current
                      ? "bg-blue-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* DETAILS */}
      <div className="p-4 space-y-2 text-sm text-gray-700 dark:text-gray-200">
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

        {formattedPrice && (
          <p className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" /> Price: {formattedPrice}
          </p>
        )}

        {mileage != null && (
          <p className="flex items-center gap-1">
            <Tag className="w-4 h-4" /> Mileage:{" "}
            {Number(mileage).toLocaleString()} mi
          </p>
        )}

        {trim && (
          <p className="flex items-center gap-1">
            <Tag className="w-4 h-4" /> Trim: {trim}
          </p>
        )}

        {inventoryType && (
          <p className="flex items-center gap-1">
            <Tag className="w-4 h-4" /> Type: {inventoryType}
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

      {/* FOOTER ACTIONS */}
      <div className="px-4 pb-4 flex justify-between items-center">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
          >
            <ExternalLink className="w-4 h-4" /> View On Site
          </a>
        ) : (
          <div />
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
                active
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {active ? "Disable" : "Activate"}
            </button>
          )}
        </div>
      </div>

      {/* LIGHTBOX */}
      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative max-w-full max-h-full">
            <img
              src={displayImages[current]}
              alt={`${year} ${make} ${model}`}
              className="max-h-[80vh] object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/placeholder-car.svg";
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
  );
}
