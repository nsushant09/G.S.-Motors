import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Listings } from './pages/Listings';
import { CarDetail } from './pages/CarDetail';
import { SellYourCar } from './pages/SellYourCar';
import { Gallery } from './pages/Gallery';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminCars } from './pages/admin/AdminCars';
import { AdminCarForm } from './pages/admin/AdminCarForm';
import { AdminQuotes } from './pages/admin/AdminQuotes';
import { AdminLayout } from './components/admin/AdminLayout';
import { RequireAdmin } from './components/admin/RequireAdmin';

function PublicLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
      <Nav key={isHome ? 'hero' : 'solid'} transparentAtTop={isHome} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/cars/:slug" element={<CarDetail />} />
        <Route path="/sell" element={<SellYourCar />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/cars" replace />} />
          <Route path="/admin/cars" element={<AdminCars />} />
          <Route path="/admin/cars/new" element={<AdminCarForm />} />
          <Route path="/admin/cars/:id/edit" element={<AdminCarForm />} />
          <Route path="/admin/quotes" element={<AdminQuotes />} />
        </Route>
      </Route>
    </Routes>
  );
}
