import { useState, useEffect, useRef } from 'react';
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function SmartSearchBar() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ customers: [], inventory: [] });
  const [open, setOpen] = useState(false);
  const timer = useRef();

  useEffect(() => {
    if (!query.trim()) {
      setResults({ customers: [], inventory: [] });
      return;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetch(`${API_BASE}/search?q=${encodeURIComponent(query.trim())}`)
        .then(r => (r.ok ? r.json() : Promise.reject()))
        .then(data => setResults(data))
        .catch(() => setResults({ customers: [], inventory: [] }));
    }, 300);
  }, [query, API_BASE]);

  const handleFocus = () => setOpen(true);
  const handleBlur = () => setTimeout(() => setOpen(false), 150);

  const clear = () => {
    setQuery('');
    setResults({ customers: [], inventory: [] });
    setOpen(false);
  };

  return (
    <div className="relative w-full max-w-sm">
      <form onSubmit={e => e.preventDefault()} className="flex items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow w-full">
        <Search className="w-4 h-4 text-electricblue" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search..."
          className="ml-2 flex-grow bg-transparent focus:outline-none text-sm"
        />
      </form>
      {open && (results.customers.length || results.inventory.length) ? (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded shadow max-h-60 overflow-y-auto text-sm">
          {results.customers.length > 0 && (
            <div className="px-2 py-1 font-semibold text-gray-700 dark:text-gray-200 border-b">Customers</div>
          )}
          {results.customers.map(c => (
            <Link
              key={`c-${c.id}`}
              to={`/customers/${c.id}`}
              onMouseDown={e => e.preventDefault()}
              onClick={clear}
              className="block px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {c.name}
            </Link>
          ))}
          {results.inventory.length > 0 && (
            <div className="px-2 py-1 font-semibold text-gray-700 dark:text-gray-200 border-t">Inventory</div>
          )}
          {results.inventory.map(v => (
            <Link
              key={`v-${v.id}`}
              to={`/inventory?q=${encodeURIComponent(v.vin || v.stocknumber || '')}`}
              onMouseDown={e => e.preventDefault()}
              onClick={clear}
              className="block px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {`${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim() || v.vin || v.stocknumber}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

