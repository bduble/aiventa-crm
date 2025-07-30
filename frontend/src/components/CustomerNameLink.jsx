import React from 'react';
import { useCustomerCard } from '../context/CustomerCardContext';

export default function CustomerNameLink({ id, name }) {
  const { open } = useCustomerCard();

  if (!id) return <span>{name || ''}</span>;

  return (
    <button
      type="button"
      onClick={() => open(id)}
      title="View customer card"
      className="text-blue-600 hover:underline"
    >
      {name}
    </button>
  );
}
