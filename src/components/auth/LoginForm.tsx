
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Mail, RefreshCcw } from "lucide-react";

interface LoginFormProps {
  onToggleForm: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showDiaryKeyInput, setShowDiaryKeyInput] = useState(false);
  const [diaryKey, setDiaryKey] = useState("");
  const [rememberKey, setRememberKey] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySubmitted, setRecoverySubmitted] = useState(false);
  const { login, isLoading, setDiaryKey: saveDiaryKey, saveDiaryKeyToSession, requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      if (showDiaryKeyInput && diaryKey) {
        if (rememberKey) {
          saveDiaryKeyToSession(diaryKey);
        } else {
          saveDiaryKey(diaryKey);
        }
      }
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    
    try {
      await requestPasswordReset(recoveryEmail);
      setRecoverySubmitted(true);
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  if (isRecovering) {
    return (
      <Card className="w-full max-w-md mx-auto animate-fade-in shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-diary-primary text-center">Password Recovery</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recoverySubmitted ? (
            <div className="text-center space-y-4">
              <div className="mx-auto rounded-full bg-diary-soft w-12 h-12 flex items-center justify-center mb-2">
                <Mail className="h-6 w-6 text-diary-primary" />
              </div>
              <p className="text-diary-neutral">
                If your email is registered with us, you'll receive a password reset link shortly.
              </p>
              <p className="text-diary-neutral text-sm">
                Remember that resetting your password will not recover your diary key.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePasswordRecovery} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-diary-neutral" />
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="border-diary-neutral/30 focus:border-diary-primary pl-10"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full mt-6 bg-diary-primary hover:bg-diary-secondary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : "Send Recovery Link"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsRecovering(false);
              setRecoverySubmitted(false);
            }}
            className="text-diary-primary hover:text-diary-secondary hover:underline text-sm"
          >
            Back to login
          </button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-serif font-bold text-diary-primary text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Sign in to access your secret diary
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-diary-neutral" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                className="border-diary-neutral/30 focus:border-diary-primary pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={() => setIsRecovering(true)}
                className="text-diary-primary hover:text-diary-secondary hover:underline text-xs"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-diary-neutral" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="border-diary-neutral/30 focus:border-diary-primary pl-10"
              />
            </div>
          </div>
          
          {/* Option to input diary key */}
          <div className="flex items-center justify-between pt-2">
            <Label htmlFor="diary-key-toggle" className="text-sm text-diary-neutral cursor-pointer flex items-center">
              <input 
                id="diary-key-toggle"
                type="checkbox"
                className="mr-2 h-4 w-4 rounded border-diary-neutral/30 text-diary-primary focus:ring-diary-primary"
                checked={showDiaryKeyInput}
                onChange={() => setShowDiaryKeyInput(!showDiaryKeyInput)}
              />
              I want to access encrypted entries
            </Label>
          </div>

          {showDiaryKeyInput && (
            <div className="space-y-4 pt-2 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="diary-key">Diary Key</Label>
                <Input
                  id="diary-key"
                  type="text"
                  placeholder="Your diary encryption key"
                  value={diaryKey}
                  onChange={(e) => setDiaryKey(e.target.value)}
                  className="border-diary-neutral/30 focus:border-diary-primary font-mono"
                />
              </div>
              <div className="flex items-center">
                <input 
                  id="remember-key"
                  type="checkbox"
                  className="mr-2 h-4 w-4 rounded border-diary-neutral/30 text-diary-primary focus:ring-diary-primary"
                  checked={rememberKey}
                  onChange={() => setRememberKey(!rememberKey)}
                />
                <Label htmlFor="remember-key" className="text-sm text-diary-neutral cursor-pointer">
                  Remember key for this session
                </Label>
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full mt-6 bg-diary-primary hover:bg-diary-secondary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-2">
        <div className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onToggleForm}
            className="text-diary-primary hover:text-diary-secondary hover:underline"
          >
            Create one
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
