import { Hammer, Facebook, Twitter, Instagram, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-xl font-black text-primary">
            <Hammer className="h-6 w-6" />
            NeighborShare
          </div>
          <div className="text-sm text-stone-500">
            &copy; {new Date().getFullYear()} NeighborShare. All rights reserved.
          </div>
          <div className="flex gap-4 text-stone-500">
            <a href="#" className="hover:text-primary transition-colors" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-primary transition-colors" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-primary transition-colors" aria-label="Github">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
