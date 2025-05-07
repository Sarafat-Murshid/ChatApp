import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type User = {
  id: string;
  username: string;
};

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load user from localStorage on initialization
    const storedUser = localStorage.getItem('chatUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // In a real app, this would be an API call to validate credentials
      // For this demo, we'll just mock authentication
      
      // Simple validation
      if (!username || !password) {
        return false;
      }
      
      // Mock successful login
      const user = {
        id: Date.now().toString(), // Using timestamp as ID for demo
        username,
      };
      
      // Store user info in localStorage
      localStorage.setItem('chatUser', JSON.stringify(user));
      
      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      // In a real app, this would be an API call to create a new user
      // For this demo, we'll just mock registration
      
      // Simple validation
      if (!username || !password || password.length < 6) {
        return false;
      }
      
      // Mock successful registration
      const user = {
        id: Date.now().toString(), // Using timestamp as ID for demo
        username,
      };
      
      // Store user in localStorage
      localStorage.setItem('chatUser', JSON.stringify(user));
      
      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    // Clear stored user
    localStorage.removeItem('chatUser');
    
    // Update state
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};