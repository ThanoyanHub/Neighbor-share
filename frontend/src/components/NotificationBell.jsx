import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  
  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then(r => setItems(r.data))
        .catch(() => {});
    }
  }, [user]);

  if (!user) return null;

  const unread = items.filter(i => !i.read).length;


  async function mark(item) {
    await api.put(`/notifications/${item.id}/read`);
    setItems(items.map(i => i.id === item.id ? { ...i, read: true } : i));
  }

  return (
    <div className="relative">
    
      <button className="btn-secondary !px-3" onClick={() => setOpen(!open)}>
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="rounded-full bg-primary px-2 text-xs text-white">
            {unread}
          </span>
        )}
      </button>

    
      {open && (
        <div className="card absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] p-3">
          <h4 className="mb-2 font-bold text-primary">Notifications</h4>
          
          <div className="max-h-80 space-y-2 overflow-auto">
            {items.length === 0 ? (
              <p className="text-sm text-stone-500">No notifications yet.</p>
            ) : (
              items.map(item => (
                <button
                  key={item.id}
                  onClick={() => mark(item)}
                  className={`w-full rounded-lg p-3 text-left text-sm transition ${
                    item.read ? 'bg-white hover:bg-stone-50' : 'bg-background hover:bg-stone-100'
                  }`}
                >
                  <b className={item.read ? 'text-stone-700' : 'text-stone-900'}>
                    {item.title}
                  </b>
                  <span className="block text-stone-600">{item.message}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}