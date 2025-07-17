import { Lightbulb } from "lucide-react";

export default function ProductivityWidget() {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow">
      <Lightbulb className="w-4 h-4 text-electricblue" />
      <span className="text-sm text-gray-700 dark:text-gray-300">Stay focused and keep crushing your goals!</span>
    </div>
  );
}
