import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.tsx";
import { Link } from "react-router";


const Navbar = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error("missing auth context");

  const { isLoggedin } = context;

  return (
    <nav className="w-full">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
            <div />
          <ul className="hidden md:flex gap-3 bg-gray-200 rounded px-2 py-1 text-sm">
            <li><Link to={isLoggedin ? "/listings" : "/login"} className="px-3 py-1 rounded">Listings</Link></li>
            <li><Link to={isLoggedin ? "/explore" : "/login"} className="px-3 py-1 rounded">Explore</Link></li>
            <li><Link to={isLoggedin ? "/connect" : "/login"} className="px-3 py-1 rounded">Connect</Link></li>
            <li><Link to={isLoggedin ? "/profile" : "/login"} className="px-3 py-1 rounded">Profile</Link></li>
          </ul>
        </div>
        <div><a href={isLoggedin ? "/listings" : "/"} className="mt-4 text-6xl font-semibold">Village</a></div>
      </div>
    </nav>
  );
}

export default Navbar;