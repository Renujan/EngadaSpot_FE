// E:\work\Spot\spice-track-hub-98\src\contexts\AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: { id: number; username: string; role: string } | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ id: number; username: string; role: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check for stored tokens and user on initial load
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (accessToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUser(userData);
      } catch (error) {
        // Invalid user data, clear it
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        toast({
          title: "Session error",
          description: "Your session data is invalid. Please sign in again.",
          variant: "destructive",
        });
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login/`, { // Updated from process.env
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Invalid credentials';
        
        // Show error message
        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      const { access, refresh, user: userData } = data;

      // Store tokens and user info in localStorage
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setIsAuthenticated(true);
      setUser(userData);
      
      // Show success message
      toast({
        title: "Sign in successful",
        description: `Welcome back, ${userData.username}! You have been signed in successfully.`,
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Something went wrong. Please check your connection and try again.';
      
      // Show error message
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/token/refresh/`, { // Updated from process.env
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const { access } = data;

      localStorage.setItem('accessToken', access);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Show session expired message
      toast({
        title: "Session expired",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const logout = () => {
    const username = user?.username || 'User';
    
    // Clear authentication data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    
    // Show sign out message
    toast({
      title: "Signed out successfully",
      description: `Goodbye, ${username}! You have been signed out.`,
    });
    
    navigate('/login');
  };

  // Periodically refresh token
  useEffect(() => {
    const interval = setInterval(() => {
      refreshToken();
    }, Number(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL) || 5 * 60 * 1000); // Updated from process.env
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};