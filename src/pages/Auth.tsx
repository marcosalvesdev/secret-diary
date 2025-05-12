
import React, { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { Shield } from "lucide-react";

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-diary-light">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="mx-auto h-16 w-16 rounded-full bg-diary-soft flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-diary-primary" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-diary-primary">
          Secret Diary
        </h2>
        <p className="mt-2 text-sm text-diary-neutral max-w-md mx-auto">
          A private space for your thoughts, secured by encryption only you can unlock
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {isLogin ? (
          <LoginForm onToggleForm={() => setIsLogin(false)} />
        ) : (
          <SignupForm onToggleForm={() => setIsLogin(true)} />
        )}
      </div>
      
      <div className="mt-10 text-center">
        <p className="text-xs text-diary-neutral max-w-md mx-auto">
          We never store your encryption key. If you lose it, your data cannot be recovered.
        </p>
      </div>
    </div>
  );
};

export default Auth;
