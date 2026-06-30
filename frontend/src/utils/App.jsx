import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BrowseTools from './pages/BrowseTools';
import ToolDetails from './pages/ToolDetails';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import UserProfile from './components/UserProfile';


function Protected({ children, admin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="py-20 text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (admin && user.role !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}


function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-primary">Profile</h1>
        <p className="text-stone-600">Update your NeighborShare account details.</p>
      </div>
      <section className="card p-5">
        <UserProfile />
      </section>
    </div>
  );
}


export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tools" element={<BrowseTools />} />
        <Route path="/tools/:id" element={<ToolDetails />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected>
              <ProfilePage />
            </Protected>
          }
        />

        
        <Route
          path="/admin"
          element={
            <Protected admin>
              <AdminDashboard />
            </Protected>
          }
        />

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}