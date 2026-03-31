import { useState, createContext, type ReactNode, useCallback, useContext } from "react";
import type { AuthContextType, LoginFormData, SignUpFormData, User } from "../types/auth.ts";
//import { useNavigate} from "react-router";
//import { Link } from "react-router";

export const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  //const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = useCallback(async (data: LoginFormData) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const profileResponse = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (profileResponse.ok) {
        const userData = await profileResponse.json();
        setUser({
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          roles: userData.roles || ['user'],
        }
        );
        setIsLoggedin(true);
        //navigate("/");
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
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      setIsLoggedin(true);
      //navigate("/");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      } catch (error) {
      console.log(error);
      } finally {
      //navigate("/login");
      setIsLoggedin(false);
      setUser(null);
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
