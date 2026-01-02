import { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole } from "@/domain/entities/User";

interface AuthContextType {
  user: User | null;
  login: (username: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Default mock user
  const [user, setUser] = useState<User | null>(User.create("Default Admin", UserRole.ADMIN));

  const login = (username: string, role: UserRole) => {
    setUser(User.create(username, role));
  };

  const logout = () => {
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
