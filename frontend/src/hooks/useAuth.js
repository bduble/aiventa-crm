import { useState } from 'react';

export default function useAuth() {
  // Placeholder hook. Replace with real auth logic as needed.
  const [user] = useState({ name: 'Brian' });
  return { user };
}
