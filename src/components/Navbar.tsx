

const Navbar = () => {
  return (
    <nav className="bg-gray-900 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">Village</div>
        <div>
          <a href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Search
          </a>
          <a href="/about" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            About
          </a>
          <a href="/contact" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;