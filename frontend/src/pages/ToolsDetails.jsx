import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { currency, today } from '../utils/date';
import Toast from '../components/Toast';
import { Spinner } from '../components/Loading';

export default function ToolDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [tool, setTool] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [dates, setDates] = useState({
    start_date: today(),
    end_date: today(),
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/tools/' + id).then((r) => setTool(r.data));
    api.get('/reviews/tool/' + id).then((r) => setReviews(r.data));
  }, [id]);

  async function borrow() {
    if (!user) {
      setErr('Please log in before borrowing.');
      return;
    }

    if (!tool.is_available) {
      setErr('This tool is not available for now.');
      return;
    }

    try {
      await api.post('/reservations', {
        tool_id: id,
        ...dates,
      });

      setMsg('Reservation request submitted.');
    } catch (e) {
      setErr(
        e.response?.data?.detail || 'Could not submit reservation'
      );
    }
  }

  if (!tool) return <Spinner />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
      <div className="space-y-4">
        <div className="relative">
          <img
            className="h-[460px] w-full rounded-lg object-cover shadow-soft"
            src={tool.image_url}
            alt={tool.name}
          />

          {!tool.is_available && (
            <span className="absolute left-4 top-4 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-soft">
              {tool.availability_label || 'Not available for now'}
            </span>
          )}
        </div>

        <div className="card p-5">
          <h1 className="text-3xl font-black text-primary">
            {tool.name}
          </h1>

          <p className="mt-2 text-stone-700">
            {tool.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge">{tool.category}</span>

            <span className="badge">{tool.condition}</span>

            <span className="badge">
              Rating {tool.average_rating || 0} ({tool.review_count})
            </span>

            {!tool.is_available && (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                Not available for now
              </span>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-xl font-bold text-primary">
            Reviews
          </h2>

          {reviews.length ? (
            reviews.map((r) => (
              <div key={r.id} className="border-t py-3">
                <b>
                  {r.rating}/5 by {r.borrower_name}
                </b>

                <p className="text-sm text-stone-600">
                  {r.comment}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-600">
              No reviews yet.
            </p>
          )}
        </div>
      </div>

      <aside className="card h-fit space-y-4 p-5">
        <h2 className="text-xl font-bold text-primary">
          Borrow this tool
        </h2>

        <p className="text-3xl font-black text-primary">
          {currency(tool.daily_rate)}
          <span className="text-sm font-medium text-stone-500">
            {' '}
            per day
          </span>
        </p>

        <p className="text-sm text-stone-600">
          Owner: {tool.owner_name}
        </p>

        {!tool.is_available && (
          <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
            This tool is not available for now.
          </p>
        )}

        <div>
          <label>Start date</label>

          <input
            className="input"
            type="date"
            min={today()}
            value={dates.start_date}
            onChange={(e) =>
              setDates({
                ...dates,
                start_date: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label>End date</label>

          <input
            className="input"
            type="date"
            min={dates.start_date}
            value={dates.end_date}
            onChange={(e) =>
              setDates({
                ...dates,
                end_date: e.target.value,
              })
            }
          />
        </div>

        <div>
          <h3 className="font-bold text-primary">
            Blackout dates
          </h3>

          <p className="text-sm text-stone-600">
            {tool.blackout_dates?.length
              ? tool.blackout_dates.join(', ')
              : 'None listed'}
          </p>
        </div>

        <button
          className="btn-primary w-full"
          disabled={!tool.is_available}
          onClick={borrow}
        >
          {tool.is_available ? 'Borrow' : 'Not available'}
        </button>
      </aside>

      <Toast
        message={msg || err}
        type={err ? 'error' : 'info'}
        onClose={() => {
          setMsg('');
          setErr('');
        }}
      />
    </div>
  );
}