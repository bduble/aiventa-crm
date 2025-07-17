import React from "react";
import { Bell } from "lucide-react";

export default function NotificationsBar() {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow">
      <Bell className="w-4 h-4 text-electricblue" />
      <span className="text-sm text-gray-700 dark:text-gray-300">No new notifications</span>
    </div>
  );
}
