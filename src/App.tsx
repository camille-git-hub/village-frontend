//import { useAuth } from './context/AuthContext';
//import { SignUp } from './pages/SignUp';
//import { Login } from './pages/Login';
//import { useContext } from 'react';
//import AuthProvider from './context/AuthContext.tsx';
import { BrowserRouter, Route, Routes } from 'react-router';
import LoginPage from './pages/Login.tsx';
import SignUpPage from './pages/SignUp.tsx';
import { AuthLayout } from './layouts/AuthLayout.tsx';
import MainLayout from './layouts/MainLayout.tsx';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes using AuthLayout */}
        <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
        </Route>

        {/* Main App Routes using MainLayout */}
        <Route element={<MainLayout />}>
            {/*<Route path="/" element={<Dashboard />} />*/}
            {/*<Route path="/services" element={<Listings />} />*/}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
