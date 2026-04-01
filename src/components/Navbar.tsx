

const Navbar = () => {
  return (
    <nav className="w-full">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
            <div />
          <ul className="hidden md:flex gap-3 bg-gray-200 rounded px-2 py-1 text-sm">
            <li><a href="/listings" className="px-3 py-1 rounded">Listings</a></li>
            <li><a href="/explore" className="px-3 py-1 rounded">Explore</a></li>
            <li><a href="/connect" className="px-3 py-1 rounded">Connect</a></li>
            <li><a href="/profile" className="px-3 py-1 rounded">Profile</a></li>
          </ul>
        </div>
        <div><a href="/" className="mt-4 text-6xl font-semibold">Village</a></div>
      </div>
    </nav>
  );
}

export default Navbar;