import React, { useState } from "react";
import { Search } from "lucide-react";

export default function SmartSearchBar() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Placeholder for real search logic
    console.log("Searching for", query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow w-full max-w-sm">
      <Search className="w-4 h-4 text-electricblue" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="ml-2 flex-grow bg-transparent focus:outline-none text-sm"
      />
    </form>
  );
}
