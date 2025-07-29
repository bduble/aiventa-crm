import { createContext, useContext, useState } from 'react';
import CustomerCardOverlay from '../components/CustomerCardOverlay';

const CustomerCardContext = createContext({ open: () => {}, close: () => {} });

export function CustomerCardProvider({ children }) {
  const [customerId, setCustomerId] = useState(null);
  const open = id => setCustomerId(id);
  const close = () => setCustomerId(null);
  return (
    <CustomerCardContext.Provider value={{ open, close }}>
      {children}
      <CustomerCardOverlay customerId={customerId} onClose={close} />
    </CustomerCardContext.Provider>
  );
}

export function useCustomerCard() {
  return useContext(CustomerCardContext);
}
