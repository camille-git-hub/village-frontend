import { Route, Routes} from 'react-router';
import LoginPage from './pages/Login.tsx';
import SignUpPage from './pages/SignUp.tsx';
import MainLayout from './layouts/MainLayout.tsx';
import { LandingLayout } from './layouts/LandingLayout.tsx';
import LandingPage from './pages/LandingPage.tsx';
import ListingsPage from './pages/Listings.tsx';
import { useAuth } from './context/AuthContext.tsx';
import Profile from './pages/Profile.tsx';
import CreateEditListing from './pages/CreateListing.tsx';
import { Connect } from './pages/Connect.tsx';
import { Explore } from './pages/Explore.tsx';
import ListingDetailsPage from './pages/ListingDetailsPage.tsx';
import { EditListingPage } from './pages/EditListingPage.tsx';
import Inbox from './pages/Inbox.tsx';
import ChatThread from './pages/ChatThread.tsx';

function App() {
  const { isLoggedin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
      <Routes>
        {isLoggedin ? (
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/new" element={<CreateEditListing />} />
            <Route path="/listings/:_id" element={<ListingDetailsPage />} />
            <Route path="/explore" element={<Explore />} />
              <Route path="/connect" element={<Inbox />} />
              <Route path="/connect/:chatId" element={<ChatThread />} />
            <Route path="/listings/:id/edit" element={<EditListingPage />} />
            <Route path="/*" element={<ListingsPage />} />
          </Route>
        ) : (<Route element={<LandingLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/*" element={<LandingPage />} />
        </Route>)}
      </Routes>
  );
}

export default App;
