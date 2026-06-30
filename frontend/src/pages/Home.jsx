import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div>
          <p className="badge inline-block">Community tool lending</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-primary md:text-6xl">
            NeighborShare
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-700">
            Borrow the tools you need from nearby owners, or earn from the gear sitting in your garage.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn-primary" to="/tools">
              <Search className="h-4 w-4" />
              Browse tools
            </Link>
            <Link className="btn-secondary" to="/dashboard">
              List a tool <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <img 
          className="h-[420px] w-full rounded-lg object-cover shadow-soft" 
          src="https://images.unsplash.com/photo-1586864387967-d02ef85d93e8" 
          alt="Organized workshop tools"
        />
      </section>

      {/* Features Grid */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          'Verified accounts and owner controls',
          'Conflict-checked reservations',
          'Reviews after completed rentals'
        ].map((t) => (
          <div key={t} className="card p-5">
            <CheckCircle className="mb-3 text-primary" />
            <h3 className="font-bold text-primary">{t}</h3>
            <p className="mt-1 text-sm text-stone-600">
              Built for clear, local borrowing workflows from request through return.
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}