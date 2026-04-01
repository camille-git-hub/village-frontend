//import { SignUp } from './pages/SignUp';
//import { Login } from './pages/Login';
import { BrowserRouter, Route, Routes} from 'react-router';
import LoginPage from './pages/Login.tsx';
import SignUpPage from './pages/SignUp.tsx';
import { AuthLayout } from './layouts/AuthLayout.tsx';
import MainLayout from './layouts/MainLayout.tsx';
import { LandingLayout } from './layouts/LandingLayout.tsx';
import LandingPage from './pages/LandingPage.tsx';
import Listings from './pages/Listings.tsx';
import { useAuth } from './context/AuthContext.tsx';

function App() {
  const { isLoggedin } = useAuth();

  return (
      <Routes>
        {/* Landing Page Route */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Auth Routes using AuthLayout */}
        <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
        </Route>

        {/* Main App Routes using MainLayout */}
        <Route element={isLoggedin ? <MainLayout /> : <LandingLayout />}>
            {/*<Route path="/profile" element={<Profile />} />*/}
            <Route path="/listings" element={<Listings />} />
        </Route>
      </Routes>
  );
}

export default App;
