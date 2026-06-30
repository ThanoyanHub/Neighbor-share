import { useEffect, useState } from 'react';
import api from '../services/api';
import { currency } from '../utils/date';

export default function AdminDashboard() {
  const [data, setData] = useState({
    stats: {},
    users: [],
    tools: [],
    reservations: [],
    reviews: []
  });

  useEffect(() => {
    Promise.all([
      '/admin/stats',
      '/admin/users',
      '/admin/tools',
      '/admin/reservations',
      '/admin/reviews'
    ].map(u => api.get(u)))
    .then(([stats, users, tools, reservations, reviews]) => setData({
      stats: stats.data,
      users: users.data,
      tools: tools.data,
      reservations: reservations.data,
      reviews: reviews.data
    }));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-primary">Admin Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(data.stats).map(([k, v]) => (
          <div className="card p-4" key={k}>
            <p className="text-xs uppercase text-stone-500">{k.replaceAll('_', ' ')}</p>
            <b className="text-2xl text-primary">{v}</b>
          </div>
        ))}
      </div>

     
      <AdminTable 
        title="Users" 
        rows={data.users} 
        cols={['full_name', 'email', 'role', 'phone_number']} 
      />
      <AdminTable 
        title="Tools" 
        rows={data.tools} 
        cols={['name', 'category', 'owner_name', 'daily_rate']} 
      />
      <AdminTable 
        title="Reservations" 
        rows={data.reservations} 
        cols={['tool_name', 'borrower_name', 'owner_name', 'status', 'total_price']} 
      />
      <AdminTable 
        title="Reviews" 
        rows={data.reviews} 
        cols={['borrower_name', 'rating', 'comment']} 
      />
    </div>
  );
}


function AdminTable({ title, rows, cols }) { 
  return (
    <section className="card overflow-auto p-5">
      <h2 className="mb-3 text-xl font-bold text-primary">{title}</h2>
      
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead>
          <tr>
            {cols.map(c => (
              <th className="border-b py-2 text-stone-600 uppercase text-xs" key={c}>
                {c.replaceAll('_', ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-stone-50/50">
              {cols.map(c => (
                <td className="border-b py-2 text-stone-800" key={c}>
                  {c.includes('price') || c === 'daily_rate' 
                    ? currency(row[c]) 
                    : String(row[c] ?? '')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {!rows.length && (
        <p className="mt-4 text-center text-sm text-stone-500">No records found.</p>
      )}
    </section>
  ); 
}