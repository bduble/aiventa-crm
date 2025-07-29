import React, { useState } from "react";

// Tab Context (not required for minimal use, but helpful if you expand)
const TabsContext = React.createContext();

export function Tabs({ value, onValueChange, children, className = "" }) {
  // For minimal use, just render children. Real state is handled in parent.
  return (
    <div className={className}>
      <TabsContext.Provider value={{ value, onValueChange }}>
        {children}
      </TabsContext.Provider>
    </div>
  );
}

export function TabsList({ children }) {
  return <div className="flex gap-2">{children}</div>;
}

export function TabsTrigger({ value, children, className = "" }) {
  const ctx = React.useContext(TabsContext);
  const selected = ctx?.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx?.onValueChange?.(value)}
      className={`px-4 py-1.5 rounded-xl border ${selected ? "bg-primary text-white" : "bg-white text-black"} ${className}`}
      style={{ fontWeight: selected ? 700 : 500 }}
    >
      {children}
    </button>
  );
}
