// components/CustomerVehicleCard.jsx
export default function CustomerVehicleCard({ vehicle }) {
  const {
    year, make, model, trim, price, msrp, mileage, imageLink, exterior_color, interior_color, stocknumber
  } = vehicle;
  const image = imageLink?.split(",")[0] || "/images/placeholder-car.svg";

  return (
    <div className="max-w-md mx-auto rounded-2xl shadow-lg overflow-hidden border border-gray-200 bg-white">
      <img src={image} alt={`${year} ${make} ${model}`} className="w-full h-48 object-cover" />
      <div className="p-4 space-y-2">
        <h2 className="text-xl font-bold">{year} {make} {model} {trim && <span className="font-normal">{trim}</span>}</h2>
        <div className="flex gap-2 items-center text-lg">
          <span className="text-green-600 font-bold">{price ? `$${Number(price).toLocaleString()}` : "Contact for Price"}</span>
          {msrp && <span className="line-through text-gray-400 text-base">{`MSRP: $${Number(msrp).toLocaleString()}`}</span>}
        </div>
        {mileage != null && <div>Mileage: {Number(mileage).toLocaleString()} mi</div>}
        <div>Exterior: {exterior_color || "—"}</div>
        <div>Interior: {interior_color || "—"}</div>
        <div className="text-xs text-gray-400">Stock #: {stocknumber}</div>
        <div className="mt-4">
          <a
            href={`tel:YOUR_STORE_PHONE`}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md font-bold hover:bg-blue-700 transition"
          >
            Call Us Today!
          </a>
        </div>
      </div>
      <div className="p-2 text-xs text-gray-400 text-center">Powered by Garlyn Shelton</div>
    </div>
  );
}
