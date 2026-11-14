import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import API_URL from "../utils/apiConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether the user has an active session
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setUser(null);
        return null;
      }

      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Session verification failed:", error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify session when the application loads
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Logout
  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        refreshUser,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}