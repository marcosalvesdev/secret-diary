
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

interface SignupFormProps {
  onToggleForm: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [diaryKey, setDiaryKey] = useState("");
  const [keyConfirmed, setKeyConfirmed] = useState(false);
  const [showDiaryKey, setShowDiaryKey] = useState(false);
  const [step, setStep] = useState<"signup" | "diaryKey">("signup");
  
  const { signup, isLoading, saveDiaryKeyToSession } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return; // We'll handle this validation in a real app
    }
    
    try {
      if (step === "signup") {
        const generatedKey = await signup(email, password);
        setDiaryKey(generatedKey);
        setStep("diaryKey");
      } else if (step === "diaryKey" && keyConfirmed) {
        // In a real app, you might save the diary key in session here
        saveDiaryKeyToSession(diaryKey);
      }
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-serif text-diary-primary text-center">
          {step === "signup" ? "Create Account" : "Save Your Diary Key"}
        </CardTitle>
        <CardDescription className="text-center">
          {step === "signup" 
            ? "Sign up to start your encrypted diary journey" 
            : "This key is required to decrypt your entries"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "signup" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                className="border-diary-neutral/30 focus:border-diary-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="border-diary-neutral/30 focus:border-diary-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="border-diary-neutral/30 focus:border-diary-primary"
              />
              {password !== confirmPassword && confirmPassword.length > 0 && (
                <p className="text-xs text-destructive mt-1">Passwords do not match</p>
              )}
            </div>
            
            <Alert className="bg-diary-soft/40 border-diary-primary/20 text-diary-secondary">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                After sign up, you'll receive a unique encryption key. 
                <strong> This key cannot be recovered if lost.</strong>
              </AlertDescription>
            </Alert>
            
            <Button 
              type="submit" 
              className="w-full mt-6 bg-diary-primary hover:bg-diary-secondary"
              disabled={isLoading || password !== confirmPassword}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert className="bg-diary-soft/40 border-diary-primary/20 mb-6">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <span className="font-bold">IMPORTANT:</span> We cannot recover your diary key if lost.
                Without it, your encrypted entries will remain permanently inaccessible.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="diary-key">Your Diary Key</Label>
              <div className="relative">
                <Input
                  id="diary-key"
                  type={showDiaryKey ? "text" : "password"}
                  value={diaryKey}
                  readOnly
                  className="font-mono bg-diary-light border-diary-neutral/30 pr-20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs"
                  onClick={() => setShowDiaryKey(!showDiaryKey)}
                >
                  {showDiaryKey ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-6">
              <input 
                id="confirm-key"
                type="checkbox"
                className="h-4 w-4 rounded border-diary-neutral/30 text-diary-primary focus:ring-diary-primary"
                checked={keyConfirmed}
                onChange={() => setKeyConfirmed(!keyConfirmed)}
              />
              <Label htmlFor="confirm-key" className="text-sm">
                I have saved my diary key in a secure location
              </Label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6 bg-diary-primary hover:bg-diary-secondary"
              disabled={!keyConfirmed || isLoading}
            >
              {isLoading ? "Processing..." : "Continue to My Diary"}
            </Button>
          </form>
        )}
      </CardContent>
      {step === "signup" && (
        <CardFooter className="flex justify-center pt-2">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onToggleForm}
              className="text-diary-primary hover:text-diary-secondary hover:underline"
            >
              Sign in
            </button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default SignupForm;
