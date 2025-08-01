import { useState, useEffect, useRef } from "react";
import Fuse from "fuse.js";
import supabase from "../supabase";

function validateEmail(email) {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email);
}
function formatPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  return phone;
}
function validateCompany(name) {
  return !!name && name.trim().length > 2;
}

export default function CustomerPicker({ value, onSelect, mode = "all" }) {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [fuse, setFuse] = useState(null);
  const [results, setResults] = useState([]);
  const [hoverIdx, setHoverIdx] = useState(-1);
  const [selected, setSelected] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [newForm, setNewForm] = useState({
    is_business: false,
    first_name: "",
    last_name: "",
    company_name: "",
    email: "",
    phone: "",
    tags: [],
  });
  const [warn, setWarn] = useState("");
  const [error, setError] = useState("");

  const inputRef = useRef();

  // 1. Load customers/companies
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: err } = await supabase
        .from("customers")
        .select("id, is_business, company_name, first_name, last_name, customer_name, email, phone, tags")
        .order("last_name", { ascending: true });
      if (!err && active && data) {
        setCustomers(data);
        setFuse(
          new Fuse(data, {
            keys: [
              "first_name",
              "last_name",
              "company_name",
              "email",
              "phone",
              "tags",
              "customer_name",
              {
                name: "all",
                getFn: (c) =>
                  `${c.first_name || ""} ${c.last_name || ""} ${c.company_name || ""} ${c.customer_name || ""} ${c.email || ""} ${c.phone || ""} ${(c.tags || []).join(" ")}`,
              },
            ],
            threshold: 0.3,
          })
        );
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // 2. Fuzzy search and dupe warn
  useEffect(() => {
    if (search.trim() && fuse) {
      let result = fuse.search(search).slice(0, 10).map((r) => r.item);
      if (mode === "people") result = result.filter((c) => !c.is_business);
      if (mode === "business") result = result.filter((c) => c.is_business);
      setResults(result);
      setShowDropdown(true);

      const warnDupe = result.find((c) =>
        (newForm.is_business && c.company_name && c.company_name.toLowerCase() === newForm.company_name.toLowerCase()) ||
        (!newForm.is_business &&
          ((c.email && c.email.toLowerCase() === newForm.email.toLowerCase()) ||
           (c.phone && c.phone.replace(/\D/g, "") === newForm.phone.replace(/\D/g, ""))))
      );
      setWarn(warnDupe ? "Possible duplicate customer/business!" : "");
    } else {
      setResults([]);
      setShowDropdown(false);
      setWarn("");
    }
  }, [search, fuse, newForm, mode]);

  // 3. Handle selection and preview
  function handleSelect(c) {
    setSelected(c);
    setShowDropdown(false);
    setWarn("");
    setError("");
    setShowAdd(false);
    onSelect && onSelect(c); // Always pass full object (with id!)
  }

  // 4. Keyboard nav
  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      setHoverIdx((idx) => Math.min(results.length - 1, idx + 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHoverIdx((idx) => Math.max(-1, idx - 1));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (hoverIdx >= 0 && results[hoverIdx]) {
        handleSelect(results[hoverIdx]);
      } else if (!results.length) {
        setShowAdd(true);
      }
      e.preventDefault();
    }
  };

  // 5. Quick Add (people or business)
  async function handleAddNew(e) {
    e.preventDefault();
    setWarn("");
    setError("");

    // Validate
    if (newForm.is_business) {
      if (!validateCompany(newForm.company_name)) {
        setError("Valid company name required.");
        return;
      }
    } else {
      if (!newForm.first_name.trim() || !newForm.last_name.trim()) {
        setError("First and last name required.");
        return;
      }
      if (newForm.email && !validateEmail(newForm.email)) {
        setError("Invalid email.");
        return;
      }
      if (newForm.phone) {
        const phone = newForm.phone.replace(/\D/g, "");
        if (phone.length !== 10) {
          setError("Phone number must be 10 digits.");
          return;
        }
      }
    }

    // Prevent hard dupe
    const dupe = customers.find(
      (c) =>
        (newForm.is_business && c.is_business && c.company_name && c.company_name.toLowerCase() === newForm.company_name.toLowerCase()) ||
        (!newForm.is_business &&
          ((newForm.email && c.email && c.email.toLowerCase() === newForm.email.toLowerCase()) ||
           (newForm.phone && c.phone && c.phone.replace(/\D/g, "") === newForm.phone.replace(/\D/g, ""))))
    );
    if (dupe) {
      setWarn("Duplicate detected, not adding.");
      return;
    }

    // Insert new customer
    try {
      const payload = {
        is_business: !!newForm.is_business,
        company_name: newForm.is_business ? newForm.company_name.trim() : null,
        first_name: !newForm.is_business ? newForm.first_name.trim() : null,
        last_name: !newForm.is_business ? newForm.last_name.trim() : null,
        email: newForm.email.trim() || null,
        phone: formatPhone(newForm.phone),
        tags: newForm.tags,
        // Always set customer_name for consistency
        customer_name: newForm.is_business
          ? newForm.company_name.trim()
          : `${newForm.first_name.trim()} ${newForm.last_name.trim()}`,
      };
      const { data, error: insertErr } = await supabase
        .from("customers")
        .insert([payload])
        .select("*")
        .maybeSingle();
      if (insertErr) throw insertErr;
      setCustomers((list) => [...list, data]);
      setFuse(
        new Fuse([...customers, data], {
          keys: [
            "first_name",
            "last_name",
            "company_name",
            "customer_name",
            "email",
            "phone",
            "tags",
            {
              name: "all",
              getFn: (c) =>
                `${c.first_name || ""} ${c.last_name || ""} ${c.company_name || ""} ${c.customer_name || ""} ${c.email || ""} ${c.phone || ""} ${(c.tags || []).join(" ")}`,
            },
          ],
          threshold: 0.3,
        })
      );
      handleSelect(data);
      setShowAdd(false);
      setNewForm({
        is_business: false,
        first_name: "",
        last_name: "",
        company_name: "",
        email: "",
        phone: "",
        tags: [],
      });
    } catch (err) {
      setError("Failed to add new customer/business.");
    }
  }

  function clearAll() {
    setSelected(null);
    setSearch("");
    setShowDropdown(false);
    setWarn("");
    setError("");
    setShowAdd(false);
    setNewForm({
      is_business: false,
      first_name: "",
      last_name: "",
      company_name: "",
      email: "",
      phone: "",
      tags: [],
    });
    onSelect && onSelect(null);
    inputRef.current && inputRef.current.focus();
  }

  // --- UI ---
  return (
    <div className="relative">
      {selected ? (
        <div className="flex items-center gap-3 bg-blue-50 p-2 rounded mb-2 shadow">
          <div>
            <b>
              {selected.is_business
                ? selected.company_name
                : selected.customer_name || `${selected.first_name} ${selected.last_name}`}
            </b>
            <div className="text-xs text-gray-600">
              {selected.email}
              {selected.email && selected.phone ? " • " : ""}
              {selected.phone}
              {selected.tags && selected.tags.length
                ? ` • ${selected.tags.join(", ")}`
                : ""}
            </div>
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto text-xs text-blue-800 hover:underline"
          >
            Change
          </button>
          <button
            type="button"
            onClick={() => setShowFull(true)}
            className="text-xs text-blue-500 hover:underline ml-2"
          >
            View Full Record
          </button>
        </div>
      ) : showAdd ? (
        <form
          onSubmit={handleAddNew}
          className="space-y-2 bg-gray-50 p-3 rounded border shadow"
        >
          <div className="flex items-center gap-4">
            <label className="font-semibold text-sm">
              <input
                type="checkbox"
                checked={newForm.is_business}
                onChange={() =>
                  setNewForm((f) => ({ ...f, is_business: !f.is_business }))
                }
                className="mr-1"
              />
              Business/Company
            </label>
            <span className="text-xs text-gray-500">(toggle for company accounts)</span>
          </div>
          {newForm.is_business ? (
            <div>
              <input
                placeholder="Company Name"
                value={newForm.company_name}
                onChange={(e) =>
                  setNewForm((f) => ({
                    ...f,
                    company_name: e.target.value,
                  }))
                }
                className="border px-2 py-1 rounded w-full mb-2"
                required
                autoFocus
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                placeholder="First Name"
                value={newForm.first_name}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, first_name: e.target.value }))
                }
                className="border px-2 py-1 rounded w-1/2"
                required
                autoFocus
              />
              <input
                placeholder="Last Name"
                value={newForm.last_name}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, last_name: e.target.value }))
                }
                className="border px-2 py-1 rounded w-1/2"
                required
              />
            </div>
          )}
          <div className="flex gap-2">
            <input
              placeholder="Email"
              value={newForm.email}
              onChange={(e) =>
                setNewForm((f) => ({ ...f, email: e.target.value }))
              }
              className="border px-2 py-1 rounded w-1/2"
              type="email"
            />
            <input
              placeholder="Phone"
              value={formatPhone(newForm.phone)}
              onChange={(e) =>
                setNewForm((f) => ({
                  ...f,
                  phone: formatPhone(e.target.value),
                }))
              }
              className="border px-2 py-1 rounded w-1/2"
              maxLength={14}
              inputMode="tel"
            />
          </div>
          <div>
            <input
              placeholder="Tags (comma separated)"
              value={newForm.tags.join(", ")}
              onChange={(e) =>
                setNewForm((f) => ({
                  ...f,
                  tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                }))
              }
              className="border px-2 py-1 rounded w-full"
            />
          </div>
          {warn && <div className="text-yellow-600 text-xs">{warn}</div>}
          {error && <div className="text-red-600 text-xs">{error}</div>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-2 py-1 text-xs rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2 py-1 text-xs rounded bg-blue-600 text-white"
              disabled={!!warn}
            >
              Add {newForm.is_business ? "Business" : "Customer"}
            </button>
          </div>
        </form>
      ) : (
        <div className="relative">
          <input
            type="text"
            placeholder={
              mode === "business"
                ? "Search company, contact, phone..."
                : mode === "people"
                ? "Search name, phone, email..."
                : "Search customer, company, phone, email..."
            }
            value={search}
            ref={inputRef}
            autoComplete="off"
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            onChange={(e) => {
              setSearch(e.target.value);
              setWarn("");
              setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            className="border px-2 py-1 rounded w-full"
          />
          {showDropdown && (results.length > 0 || search) && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-y-auto">
              {results.length === 0 ? (
                <div className="p-2 text-xs text-gray-500">
                  No matches.
                  <button
                    type="button"
                    className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded"
                    onClick={() => setShowAdd(true)}
                  >
                    Add New
                  </button>
                </div>
              ) : (
                results.map((c, idx) => (
                  <div
                    key={c.id}
                    className={`p-2 cursor-pointer flex items-center ${
                      hoverIdx === idx ? "bg-blue-100" : ""
                    }`}
                    onMouseDown={() => handleSelect(c)}
                    onMouseEnter={() => setHoverIdx(idx)}
                  >
                    <div>
                      <b>
                        {c.is_business
                          ? c.company_name
                          : c.customer_name || `${c.first_name} ${c.last_name}`}
                      </b>
                      <span className="ml-2 text-xs text-gray-700">
                        {c.email}
                        {c.email && c.phone ? " • " : ""}
                        {c.phone}
                        {c.tags && c.tags.length
                          ? ` • ${c.tags.join(", ")}`
                          : ""}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="ml-auto px-2 text-blue-500 underline text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(c);
                        setShowFull(true);
                      }}
                    >
                      View
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal for full view/edit (Optional) */}
      {/* 
      <Modal isOpen={showFull} onRequestClose={() => setShowFull(false)}>
        {selected && (
          <div>
            <h3>Full Customer Record</h3>
            <pre>{JSON.stringify(selected, null, 2)}</pre>
            <button onClick={() => setShowFull(false)}>Close</button>
            <button onClick={() => { setShowFull(false); onSelect(selected); }}>Select</button>
          </div>
        )}
      </Modal>
      */}
    </div>
  );
}
