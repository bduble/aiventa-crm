import { Phone, MessageCircle, Mail, Calendar, StickyNote } from 'lucide-react';

export default function ActionBar({ customer, onNote, onAppt, onOffer }) {
  return (
    <div className="flex gap-1">
      <button aria-label="Call" onClick={() => window.location.href = `tel:${customer.phone || ''}`} className="p-2 hover:bg-blue-100 rounded-full"><Phone className="w-4 h-4" /></button>
      <button aria-label="Text" onClick={() => window.location.href = `sms:${customer.phone || ''}`} className="p-2 hover:bg-blue-100 rounded-full"><MessageCircle className="w-4 h-4" /></button>
      <button aria-label="Email" onClick={() => window.location.href = `mailto:${customer.email || ''}`} className="p-2 hover:bg-blue-100 rounded-full"><Mail className="w-4 h-4" /></button>
      <button aria-label="Add Note" onClick={onNote} className="p-2 hover:bg-blue-100 rounded-full"><StickyNote className="w-4 h-4" /></button>
      <button aria-label="Schedule Appt" onClick={onAppt} className="p-2 hover:bg-blue-100 rounded-full"><Calendar className="w-4 h-4" /></button>
      {/* Add more action buttons as needed */}
    </div>
  );
}
