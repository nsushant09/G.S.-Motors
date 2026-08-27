import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

export function NotFound() {
  usePageMeta('Page not found', "The page you're looking for doesn't exist.");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-20 text-center">
      <p className="font-mono text-xs tracking-[0.2em] text-moss">404</p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-forest md:text-5xl">Wrong turn.</h1>
      <p className="mt-4 max-w-sm text-slate">
        That page doesn&apos;t exist, or it&apos;s moved. Try the listings, or head back home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-forest-deep">
          Back to homepage
        </Link>
        <Link
          to="/listings"
          className="rounded-full border border-moss/30 px-6 py-3 text-sm font-medium text-forest transition-colors hover:bg-moss/5"
        >
          Browse cars
        </Link>
      </div>
    </div>
  );
}
