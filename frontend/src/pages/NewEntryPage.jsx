import React, { useState } from "react";
import CreateLeadForm from "../components/CreateLeadForm";
import CreateFloorTrafficForm from "../components/CreateFloorTrafficForm";

export default function NewEntryPage() {
  const [type, setType] = useState(""); // "" means nothing selected yet

  return (
    <div className="max-w-2xl mx-auto py-10">
      {!type ? (
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-2xl font-bold mb-2">What are you adding?</h1>
          <div className="flex gap-6">
            <button
              onClick={() => setType("lead")}
              className="rounded-2xl border-2 border-blue-600 bg-white hover:bg-blue-50 shadow-xl p-8 text-lg font-semibold flex flex-col items-center transition group"
            >
              <span role="img" aria-label="Lead" className="text-4xl mb-2">🚗</span>
              New Lead
            </button>
            <button
              onClick={() => setType("floor")}
              className="rounded-2xl border-2 border-green-600 bg-white hover:bg-green-50 shadow-xl p-8 text-lg font-semibold flex flex-col items-center transition group"
            >
              <span role="img" aria-label="Visitor" className="text-4xl mb-2">🧑‍🤝‍🧑</span>
              Floor Traffic
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-4">
            <button
              onClick={() => setType("")}
              className="text-sm text-blue-700 hover:underline mr-2"
            >
              ← Back
            </button>
            <span className="font-bold text-lg">
              {type === "lead" ? "Add New Lead" : "Add Floor Traffic Entry"}
            </span>
          </div>
          {type === "lead" ? (
            <CreateLeadForm entryType="lead" />
          ) : (
            <CreateFloorTrafficForm entryType="floor" />
          )}
        </div>
      )}
    </div>
  );
}
