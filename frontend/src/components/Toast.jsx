export default function Toast({
  message,
  type = 'info',
  onClose,
}) {
  if (!message) return null;

  const tone =
    type === 'error'
      ? 'bg-red-600'
      : 'bg-primary';

  return (
    <button
      onClick={onClose}
      className={`fixed bottom-5 right-5 z-50 rounded-lg ${tone} px-4 py-3 text-left text-sm font-semibold text-white shadow-soft`}
    >
      {message}
    </button>
  );
}