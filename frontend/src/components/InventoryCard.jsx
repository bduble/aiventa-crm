import { useState } from 'react';
import AIInventoryReview from './AIInventoryReview';
import {
  ChevronLeft, ChevronRight, X, DollarSign, Tag, Droplet, Palette, ExternalLink, Copy, User, Zap
} from "lucide-react";
import toast from "react-hot-toast";

export default function InventoryCard({ vehicle, onEdit, onToggle, onAppraisal, onRequestPics, onMissingKeys, onQuickText, onQuickCall }) {
  const {
    year,
    make,
    model,
    type,
    stocknumber,
    trim,
    msrp,
    sellingprice,
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
    exterior_color,
    interior_color,
    active,
    sellNextScore,
    ai_summary,
    recon_status, // "Needs Recon", "Recon Complete", etc.
    last_lead, // {name, date}
    last_showroom_visit, // date
    assigned_customer, // {name, phone}
    fresh_trade, // true/false
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
  const images = imageFields.filter(u => typeof u === "string" && u.trim()).flatMap(u => u.split(",")).map(u => u.trim());
  const displayImages = images.length ? images : ["/images/placeholder-car.svg"];
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const prevImage = () => setCurrent(i => (i === 0 ? displayImages.length - 1 : i - 1));
  const nextImage = () => setCurrent(i => (i === displayImages.length - 1 ? 0 : i + 1));
  const formattedMSRP = msrp != null ? `$${Number(msrp).toLocaleString()}` : null;
  const formattedPrice = sellingprice != null ? `$${Number(sellingprice).toLocaleString()}` : null;

  // Utility: Copy Link
  const handleCopy = () => {
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success("Link copied!");
    }
  };

  // AI "Sell Next" and badges
  const sellNext = sellNextScore && sellNextScore > 85;
  const isFreshTrade = fresh_trade;

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 bg-white dark:bg-gray-900">
      {/* BADGES */}
      <div className="absolute left-2 top-2 flex gap-2 z-10">
        {sellNext && (
          <span className="inline-flex items-center px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs font-bold mr-1" title="AI predicts this will sell soon">
            <Zap className="w-4 h-4 mr-1" /> Sell Next
          </span>
        )}
        {isFreshTrade && (
          <span className="inline-flex items-center px-2 py-1 bg-lime-200 text-lime-800 rounded text-xs font-bold" title="Fresh Trade">
            <User className="w-4 h-4 mr-1" /> Fresh Trade
          </span>
        )}
        {recon_status && (
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
              recon_status === "Recon Complete"
                ? "bg-green-200 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
            title={recon_status}
          >
            {recon_status}
          </span>
        )}
      </div>

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
                    idx === current ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
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

        {stocknumber && (
          <p className="flex items-center gap-1">
            <Tag className="w-4 h-4" /> Stock #: {stocknumber}
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
            <Tag className="w-4 h-4" /> Mileage: {Number(mileage).toLocaleString()} mi
          </p>
        )}
        {trim && (
          <p className="flex items-center gap-1">
            <Tag className="w-4 h-4" /> Trim: {trim}
          </p>
        )}
        {type && (
          <p className="flex items-center gap-1">
            <Tag className="w-4 h-4" /> Type: {type}
          </p>
        )}
        {exterior_color && (
          <p className="flex items-center gap-1">
            <Palette className="w-4 h-4" /> Exterior: {exterior_color}
          </p>
        )}
        {interior_color && (
          <p className="flex items-center gap-1">
            <Droplet className="w-4 h-4" /> Interior: {interior_color}
          </p>
        )}
        {/* Quick Customer/Lead info */}
        {assigned_customer && assigned_customer.name && (
          <p className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
            <User className="w-4 h-4" /> Assigned to: {assigned_customer.name}
            {assigned_customer.phone && (
              <>
                <button className="ml-2 text-xs underline" onClick={() => onQuickCall?.(assigned_customer.phone)}>
                  Call
                </button>
                <button className="ml-1 text-xs underline" onClick={() => onQuickText?.(assigned_customer.phone)}>
                  Text
                </button>
              </>
            )}
          </p>
        )}
        {/* Last lead & last showroom visit */}
        {last_lead && last_lead.name && (
          <p className="flex items-center gap-1 text-gray-500">
            Last Lead: {last_lead.name} ({last_lead.date && new Date(last_lead.date).toLocaleDateString()})
          </p>
        )}
        {last_showroom_visit && (
          <p className="flex items-center gap-1 text-gray-500">
            Last Showroom Visit: {new Date(last_showroom_visit).toLocaleDateString()}
          </p>
        )}
        {/* AI summary */}
        {ai_summary && (
          <div
            className="text-xs italic bg-blue-50 rounded p-2 mt-2 cursor-pointer hover:bg-blue-100"
            title="Click to see full AI review"
            onClick={() => setReviewOpen(true)}
          >
            {ai_summary.slice(0, 110)}{ai_summary.length > 110 ? "..." : ""}
          </div>
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
          <button onClick={handleCopy} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300" title="Copy link to clipboard">
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAppraisal?.(vehicle)}
            className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
            title="Send to Appraisal"
          >
            📈
          </button>
          <button
            onClick={() => onRequestPics?.(vehicle)}
            className="px-2 py-1 bg-purple-200 text-purple-800 rounded hover:bg-purple-300"
            title="Request Pics"
          >
            📷
          </button>
          <button
            onClick={() => onMissingKeys?.(vehicle)}
            className="px-2 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300"
            title="Mark as Missing Keys"
          >
            🔑
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(vehicle)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => setReviewOpen(true)}
            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition"
          >
            AI Review
          </button>
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
      <AIInventoryReview
        vehicleId={vehicle.id}
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
      />
    </div>
  );
}
