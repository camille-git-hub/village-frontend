import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext.tsx";
import { Link } from "react-router";
import { Menu, X } from "lucide-react";


const Navbar = () => {
  const context = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  if (!context) throw new Error("missing auth context");

  const { isLoggedin } = context;

  return (
    <nav className="w-full">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div />
          <ul className="font-display text-lg hidden md:flex gap-3 bg-gray-200 rounded px-2 py-1 text-sm">
            <li><Link to={isLoggedin ? "/listings" : "/login"} className="px-3 py-1 rounded hover:border hover:border-villageRed">Listings</Link></li>
            <li><Link to={isLoggedin ? "/explore" : "/login"} className="px-3 py-1 rounded hover:border hover:border-villageRed">Explore</Link></li>
            <li><Link to={isLoggedin ? "/connect" : "/login"} className="px-3 py-1 rounded hover:border hover:border-villageRed">Connect</Link></li>
            <li><Link to={isLoggedin ? "/profile" : "/login"} className="px-3 py-1 rounded hover:border hover:border-villageRed">Profile</Link></li>
          </ul>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          {isOpen && (
            <ul className="font-display text-lg mt-2 bg-gray-200 rounded px-2 py-1 text-sm">
              <li><Link to={isLoggedin ? "/listings" : "/login"} className="block px-3 py-1 rounded hover:border hover:border-villageRed">Listings</Link></li>
              <li><Link to={isLoggedin ? "/explore" : "/login"} className="block px-3 py-1 rounded hover:border hover:border-villageRed">Explore</Link></li>
              <li><Link to={isLoggedin ? "/connect" : "/login"} className="block px-3 py-1 rounded hover:border hover:border-villageRed">Connect</Link></li>
              <li><Link to={isLoggedin ? "/profile" : "/login"} className="block px-3 py-1 rounded hover:border hover:border-villageRed">Profile</Link></li>
            </ul>
          )}
        <div><a href={isLoggedin ? "/listings" : "/"} className="mt-4 text-6xl font-semibold">Village</a></div>
      </div>
    </nav>
  );
}

export default Navbar;