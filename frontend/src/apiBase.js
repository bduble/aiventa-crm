// frontend/src/apiBase.js

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://aiventa-crm.onrender.com";

export const FALLBACK_VIN_DECODER =
  import.meta.env.VITE_FALLBACK_VIN_API?.replace(/\/$/, "") ||
  "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin";
