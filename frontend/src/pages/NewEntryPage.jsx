import React, { useState } from 'react';
import CreateLeadForm from '../components/CreateLeadForm';
import CreateFloorTrafficForm from '../components/CreateFloorTrafficForm';

export default function NewEntryPage() {
  const [type, setType] = useState('floor');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-center mb-4 gap-4">
        <button
          className={`px-3 py-1 rounded border ${type === 'floor' ? 'bg-electricblue text-white' : ''}`}
          onClick={() => setType('floor')}
        >
          Floor Traffic
        </button>
        <button
          className={`px-3 py-1 rounded border ${type === 'lead' ? 'bg-electricblue text-white' : ''}`}
          onClick={() => setType('lead')}
        >
          New Lead
        </button>
      </div>
      {type === 'floor' ? <CreateFloorTrafficForm /> : <CreateLeadForm />}
    </div>
  );
}
