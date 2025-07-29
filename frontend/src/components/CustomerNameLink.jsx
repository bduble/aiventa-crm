import React from 'react';
import { Link } from 'react-router-dom';

export default function CustomerNameLink({ id, name }) {
  if (!id) return <span>{name || ''}</span>;
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
