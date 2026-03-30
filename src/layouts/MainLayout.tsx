import { Outlet } from "react-router";
import Navbar from "../components/Navbar.tsx";
import Sidebar from "../components/Sidebar.tsx";

const MainLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-container">
        <Sidebar />
        <main className="app-content">
          <Outlet /> {/* This will render the child routes, Dashboard, Services */}
        </main>
      </div>
      <footer>Footer</footer>
    </div>
  );
};

export default MainLayout;
