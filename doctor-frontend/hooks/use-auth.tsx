"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/lib/api-client";

interface User {
  id: string;
  name: string;
  email: string;
  specialization?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const userData = localStorage.getItem("user");

        if (!token) {
          // If no token and on a protected route, redirect to login
          if (
            pathname !== "/auth/login" &&
            pathname !== "/" &&
            !pathname?.startsWith("/auth/")
          ) {
            router.push("/auth/login");
          }
          setIsLoading(false);
          return;
        }

        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          // For now, just log out if user data is missing
          logout();
        }
      } catch (error) {
        console.error("Auth check error:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      console.log("Login response:", res);
      // Mock successful login
      // const mockUser = {
      //   id: "1",
      //   name: "Dr. Jane Smith",
      //   email: email,
      //   specialization: "Cardiologist",
      // };

      // Store auth token and user data
      // @ts-ignore
      localStorage.setItem("accessToken", res.data?.accessToken);
      // @ts-ignore
      localStorage.setItem("user", JSON.stringify(res.data?.user));

      // if (rememberMe) {
      //   // Set a longer expiration for the token if remember me is checked
      //   // This would be handled by your backend in a real implementation
      // }
      // @ts-ignore
      setUser(res.data?.user);

      toast({
        title: "Login successful",
        description: "Welcome back to Upchaar Doctor Portal",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);

    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });

    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
