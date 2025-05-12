
import React from "react";
import Auth from "./Auth";
import Diary from "./Diary";
import { useAuth } from "@/context/AuthContext";

const Index: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-diary-light">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-diary-primary border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4 text-diary-neutral">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Diary /> : <Auth />;
};

export default Index;
