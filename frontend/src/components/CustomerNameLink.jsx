import React from 'react';
import { Link } from 'react-router-dom';
import { useCustomerCard } from '../context/CustomerCardContext';

export default function CustomerNameLink({ id, name, onClick }) {
  const { open } = useCustomerCard();
  if (!id) return <span>{name || ''}</span>;

  const handle = () => {
    if (typeof onClick === 'function') {
      onClick(id);
    } else if (open) {
      open(id);
    }
  };

  if (open || typeof onClick === 'function') {
    return (
      <button
        type="button"
        onClick={handle}
        title="View customer card"
        className="text-blue-600 hover:underline"
      >
        {name}
      </button>
    );
  }

  return (
    <Link
      to={`/customers/${id}`}
      title="View customer card"
      className="text-blue-600 hover:underline"
    >
      {name}
    </Link>
  );
}
