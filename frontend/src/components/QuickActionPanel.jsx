import { PlusCircle, Users, Car } from "lucide-react";
import { Link } from "react-router-dom";

export default function QuickActionPanel() {
  const actions = [
    { to: "/leads/new", icon: PlusCircle, label: "New Lead" },
    { to: "/customers", icon: Users, label: "Customers" },
    { to: "/inventory", icon: Car, label: "Inventory" },
  ];

  return (
    <div className="flex gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow overflow-x-auto">
      {actions.map(({ to, icon: Icon, label }) => (
        <Link key={to} to={to} className="flex items-center gap-1 px-2 py-1 text-sm text-electricblue hover:underline whitespace-nowrap">
          <Icon className="w-4 h-4" />
          {label}
        </Link>
      ))}
    </div>
  );
}
