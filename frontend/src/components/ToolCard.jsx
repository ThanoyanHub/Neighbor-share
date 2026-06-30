import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { currency } from '../utils/date';

export default function ToolCard({ tool }) {
  return (
    <Link
      to={`/tools/${tool.id}`}
      className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative">
        <img
          src={tool.image_url}
          alt={tool.name}
          className="h-48 w-full object-cover"
        />

        {!tool.is_available && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-soft">
            {tool.availability_label || 'Not available for now'}
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="badge inline-block">
              {tool.category}
            </p>

            <h3 className="mt-2 font-bold text-primary">
              {tool.name}
            </h3>
          </div>

          <div className="text-right font-bold text-primary">
            {currency(tool.daily_rate)}

            <span className="block text-xs font-medium text-stone-500">
              per day
            </span>
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-stone-600">
          {tool.description}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span>{tool.condition}</span>

          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
            {tool.average_rating || 0}
          </span>
        </div>

        <p className="text-xs text-stone-500">
          Owner: {tool.owner_name}
        </p>
      </div>
    </Link>
  );
}