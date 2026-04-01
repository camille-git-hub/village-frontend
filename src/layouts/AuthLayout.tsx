import {Outlet} from "react-router";
import { Footer } from "../components/Footer";
import Navbar from "../components/Navbar";

export function AuthLayout() {
  return (
    <div className="auth-page">
      <Navbar /> {/* Menu tab with features */}
      <Outlet /> {/* Landing page renders here */}
      <Footer /> {/* Footer with contact info, social media links, etc. */}
    </div>
  );
}