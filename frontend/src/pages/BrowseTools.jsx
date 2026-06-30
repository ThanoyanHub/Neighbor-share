import { useEffect, useState } from 'react';
import api from '../services/api';
import ToolCard from '../components/ToolCard';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Loading';
import { categories } from '../utils/constants';
import { useDebounce } from '../hooks/useDebounce';

export default function BrowseTools() {
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    min_price: '',
    max_price: '',
  });

  const debounced = useDebounce(filters);

  const [data, setData] = useState({
    items: [],
    total: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    api
      .get('/tools', {
        params: Object.fromEntries(
          Object.entries(debounced).filter(([, v]) => v !== '')
        ),
      })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [debounced]);

  function set(k, v) {
    setFilters({
      ...filters,
      [k]: v,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-black text-primary">
            Browse tools
          </h1>

          <p className="text-stone-600">
            Search by keyword, category, and daily price.
          </p>
        </div>

        <div className="grid gap-2 md:grid-cols-4">
          <input
            className="input"
            placeholder="Keyword"
            value={filters.q}
            onChange={(e) => set('q', e.target.value)}
          />

          <select
            className="input"
            value={filters.category}
            onChange={(e) => set('category', e.target.value)}
          >
            <option value="">All categories</option>

            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Min price"
            type="number"
            value={filters.min_price}
            onChange={(e) => set('min_price', e.target.value)}
          />

          <input
            className="input"
            placeholder="Max price"
            type="number"
            value={filters.max_price}
            onChange={(e) => set('max_price', e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : data.items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((t) => (
            <ToolCard
              key={t.id}
              tool={t}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No tools found" />
      )}
    </div>
  );
}


