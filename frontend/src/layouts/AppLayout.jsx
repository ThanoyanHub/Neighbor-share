import { Link, NavLink, Outlet } from 'react-router-dom';
import { Hammer, LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth();


  const nav = ({ isActive }) =>
    'rounded-lg px-3 py-2 text-sm font-semibold ' +
    (isActive ? 'bg-primary text-white' : 'text-secondary hover:bg-white');

  return (
    <div className="min-h-screen bg-background">
    
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          
        
          <Link to="/" className="flex items-center gap-2 text-xl font-black text-primary">
            <Hammer />
            NeighborShare
          </Link>

        
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink className={nav} to="/tools">Browse</NavLink>
            
            {user && (
              <NavLink className={nav} to="/dashboard">Dashboard</NavLink>
            )}
            
            {user && (
              <NavLink className={nav} to="/profile">
                <User className="inline h-4 w-4 mr-1" /> Profile
              </NavLink>
            )}
            
            {isAdmin && (
              <NavLink className={nav} to="/admin">
                <Shield className="inline h-4 w-4 mr-1" /> Admin
              </NavLink>
            )}
          </nav>

        
          <div className="flex items-center gap-2">
            <NotificationBell />
            
            {user ? (
              <>
                <Link className="btn-secondary md:hidden" to="/profile">
                  <User className="h-4 w-4" /> Profile
                </Link>
                <button className="btn-secondary" onClick={logout}>
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn-secondary" to="/login">Login</Link>
                <Link className="btn-primary" to="/register">Register</Link>
              </>
            )}
          </div>

        </div>
      </header>

    
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}