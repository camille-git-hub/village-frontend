export const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-700 p-4">
      <h2 className="text-xl font-bold mb-4">Sidebar</h2>
      <ul>
        <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white">Home</a></li>
        <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white">Profile</a></li>               
        <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white">Settings</a></li>
        <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white">Logout</a></li>
      </ul>
    </div>
  );
};

export default Sidebar;