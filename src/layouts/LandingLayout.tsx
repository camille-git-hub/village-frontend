import { Outlet } from 'react-router';
import Navbar from '../components/Navbar.tsx';
import Footer from '../components/Footer.tsx';

export function LandingLayout() {
  return (
    <div className="landing-layout">
      <Navbar /> {/* Menu tab with features */}
      <Outlet /> {/* Landing page renders here */}
      <Footer /> {/* Footer with contact info, social media links, etc. */}
    </div>
  );
}