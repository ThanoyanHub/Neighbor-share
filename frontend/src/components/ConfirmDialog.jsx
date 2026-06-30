import { X } from 'lucide-react';

export default function ConfirmDialog({ 
  open, 
  title, 
  text, 
  confirmLabel = 'Confirm', 
  onConfirm, 
  onClose 
}) { 
  if (!open) return null; 

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4">
      <div className="card w-full max-w-md p-5">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-primary">{title}</h3>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-700">
            <X />
          </button>
        </div>
        
        {/* Body Text */}
        <p className="mt-2 text-sm text-stone-600">
          {text}
        </p>
        
        {/* Actions Footer */}
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  ); 
}