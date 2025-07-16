import React, { useState } from 'react';
import CreateLeadForm from '../components/CreateLeadForm';
import CreateFloorTrafficForm from '../components/CreateFloorTrafficForm';

export default function NewEntryPage() {
  const [type, setType] = useState('floor');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-center mb-4 gap-2 items-center">
        <label htmlFor="entryType" className="font-medium">Entry Type:</label>
        <select
          id="entryType"
          className="border rounded px-3 py-1"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="floor">Floor Traffic</option>
          <option value="lead">New Lead</option>
        </select>
      </div>
      {type === 'floor' ? <CreateFloorTrafficForm /> : <CreateLeadForm />}
    </div>
  );
}
