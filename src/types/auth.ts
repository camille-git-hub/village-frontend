
export type SignUpFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginFormData = {
  email: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isLoggedin: boolean;
  handleLogin: (data: LoginFormData) => Promise<void>;
  handleRegister: (data: SignUpFormData) => Promise<void>;
  handleLogout: () => void;
};

export type AuthProviderProps = {
  children: React.ReactNode;
};