import { Route, Routes} from 'react-router';
import LoginPage from './pages/Login.tsx';
import SignUpPage from './pages/SignUp.tsx';
import { AuthLayout } from './layouts/AuthLayout.tsx';
import MainLayout from './layouts/MainLayout.tsx';
import { LandingLayout } from './layouts/LandingLayout.tsx';
import LandingPage from './pages/LandingPage.tsx';
import Listings from './pages/Listings.tsx';
import { useAuth } from './context/AuthContext.tsx';
import Profile from './pages/Profile.tsx';
import CreateEditListing from './pages/CreateEditListing.tsx';
import { Connect } from './pages/Connect.tsx';
import { Explore } from './pages/Explore.tsx';

function App() {
  const { isLoggedin } = useAuth();

  return (
      <Routes>
        {isLoggedin ? (
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/new" element={<CreateEditListing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/connect" element={<Connect />} />
          </Route>
        ) : <Route element={<LandingLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
        </Route>}
      </Routes>
  );
}

export default App;
