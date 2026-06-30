import { SearchX } from 'lucide-react';

export default function EmptyState({
  title = 'Nothing here yet',
  text = 'Try changing filters or check back soon.',
}) {
  return (
    <div className="card flex flex-col items-center justify-center p-10 text-center">
      <SearchX className="mb-3 h-10 w-10 text-secondary" />

      <h3 className="text-lg font-bold text-primary">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-sm text-stone-600">
        {text}
      </p>
    </div>
  );
}