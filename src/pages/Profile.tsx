import { use } from 'react';
import { AuthContext } from '../context/AuthContext.tsx';
import { Navigate } from 'react-router';

export const Profile = () => {
    const context = use(AuthContext);

    if (!context) throw new Error("missing auth context");

    const { isLoggedin, isLoading } = context;

    const handleLogout = () => {
        context.handleLogout();
    }

    if (!isLoading && !isLoggedin) {
    return <Navigate to={"/"} />;}

    

    return (
        <div className="p-4">
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
            <p>This is where users can view and edit their profile information.</p>
        </div>
        <div className="p-4">
            <button onClick={handleLogout} className="bg-blue-500 text-white px-4 py-2 rounded">Logout</button>
        </div>
        </div>
    );
};

export default Profile;