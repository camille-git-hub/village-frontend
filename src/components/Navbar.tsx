

const Navbar = () => {
  return (
    <nav className="w-full">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="mt-6 text-6xl font-semibold">Village</div>
          <ul className="hidden md:flex gap-3 bg-gray-200 rounded px-2 py-1 text-sm">
            <li className="px-3 py-1 rounded">Listings</li>
            <li className="px-3 py-1 rounded">Explore</li>
            <li className="px-3 py-1 rounded">Connect</li>
            <li className="px-3 py-1 rounded">Profile</li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;