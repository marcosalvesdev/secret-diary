
import { useState } from "react";
import { User } from "@/types/auth";
import { useToast } from "@/components/ui/use-toast";
import { 
  saveUserToStorage,
  clearAuthStorage,
  saveDiaryKeyToSessionStorage,
  generateDiaryKey
} from "@/utils/authStorage";

export const useAuthActions = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // For demo, we'll "log in" with any credentials that match our format
      const mockUser = {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        email,
      };

      saveUserToStorage(mockUser);
      
      toast({
        title: "Login successful",
        description: "Welcome back to your secret diary!",
      });
      
      return Promise.resolve();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Create a mock user
      const mockUser = {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        email,
      };

      saveUserToStorage(mockUser);
      
      // Generate diary key
      const diaryKey = generateDiaryKey();

      toast({
        title: "Account created",
        description: "Welcome to your secret diary!",
      });
      
      return diaryKey;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!email) {
        throw new Error('Email is required');
      }

      toast({
        title: "Recovery email sent",
        description: "If your email is registered, you'll receive a recovery link shortly",
      });
      
      return Promise.resolve();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    login,
    signup,
    requestPasswordReset
  };
};
