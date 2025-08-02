// frontend/src/apiBase.js

// Main backend API URL (Vite syntax)
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "/api";

// Fallback public VIN decoder, if you want it:
export const FALLBACK_VIN_DECODER =
  import.meta.env.VITE_FALLBACK_VIN_API?.replace(/\/$/, "") ||
  "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin";
