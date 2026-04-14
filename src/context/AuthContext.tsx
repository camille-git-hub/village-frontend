import { useState, createContext, type ReactNode, useCallback, useContext, useEffect } from "react";
import type { AuthContextType, LoginFormData, SignUpFormData, User } from "../types/auth.ts";
import { useNavigate} from "react-router";
//import { Link } from "react-router";

export const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:4000";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        const response = await fetch(`${AUTH_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const userData = await response.json();
          console.log('Authenticated user:', userData);
          setUser({
            _id: userData._id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            roles: userData.roles || ['user'],
          });
          setIsLoggedin(true);
        } else {
          console.log('No authenticated user found');
          setIsLoggedin(false); 
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsLoggedin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = useCallback(async (data: LoginFormData) => {
    try {
      const response = await fetch(`${AUTH_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const profileResponse = await fetch(`${AUTH_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (profileResponse.ok) {
        const userData = await profileResponse.json();
        setUser({
          _id: userData._id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          roles: userData.roles || ['user'],
        }
        );
        setIsLoggedin(true);
        navigate("/listings");
      }
    
    } catch (error) {
      console.log('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRegister = useCallback(async (data: SignUpFormData) =>{
    setIsLoading(true);
    try {
      const response = await fetch(`${AUTH_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      console.log('Registration successful, logging in...');
      const profileResponse = await fetch(`${AUTH_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (profileResponse.ok) {
        const userData = await profileResponse.json();
        console.log('User data received:', userData);
        setUser({
          _id: userData._id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          roles: userData.roles || ['user'],
        });
      }
      setIsLoggedin(true);
      navigate("/listings");
    } catch (error) {
      console.log(error);
      navigate("/login");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetch(`${AUTH_URL}/auth/logout`, {
        method: "DELETE",
        credentials: "include",
      });
      console.log('Logout successful');
      } catch (error) {
      console.log(error);
      } finally {
      navigate("/login");
      setIsLoggedin(false);
      setUser(null);
      setIsLoading(false);
      }
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AUTH_URL}/auth/delete`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Account deletion failed");
      }
      console.log('Account deleted successfully');
    } catch (error) {
      console.log(error);
    } finally {
      navigate("/login");
      setIsLoggedin(false);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        handleLogin,
        handleRegister,
        handleLogout,
        isLoggedin,
        isLoading,
        handleDeleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
