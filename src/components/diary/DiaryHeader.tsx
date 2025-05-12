
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Key, LogOut, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";

interface DiaryHeaderProps {
  onNewEntry: () => void;
}

const DiaryHeader: React.FC<DiaryHeaderProps> = ({ onNewEntry }) => {
  const { user, logout, diaryKey, saveDiaryKeyToSession, hasSavedDiaryKey } = useAuth();
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleSaveDiaryKey = () => {
    if (keyInput) {
      saveDiaryKeyToSession(keyInput);
      setKeyInput("");
      setIsKeyDialogOpen(false);
    }
  };

  return (
    <header className="bg-white border-b border-diary-neutral/10 py-4 px-6 flex items-center justify-between">
      <div>
        <a href="/" className="flex">
        <h1 className="font-serif font-bold text-2xl text-diary-primary">Secret Diary</h1>
        </a>
        {user && (
          <p className="text-sm text-diary-neutral mt-1">{user.email}</p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {!hasSavedDiaryKey && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center text-diary-secondary border-diary-secondary/30 hover:bg-diary-soft/50"
            onClick={() => setIsKeyDialogOpen(true)}
          >
            <Key className="h-4 w-4 mr-1" />
            Set Diary Key
          </Button>
        )}
        <Button 
          onClick={onNewEntry}
          size="sm"
          className="bg-diary-primary hover:bg-diary-secondary"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Entry
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="text-diary-neutral hover:text-diary-dark hover:bg-diary-light"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Diary Key Dialog */}
      <Dialog open={isKeyDialogOpen} onOpenChange={setIsKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Your Diary Key</DialogTitle>
            <DialogDescription>
              Enter your diary key to access encrypted entries
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="diary-key">Diary Key</Label>
              <div className="relative">
                <Input
                  id="diary-key"
                  placeholder="Enter your diary key"
                  type={showKey ? "text" : "password"}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="font-mono pr-16"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs h-7"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
            {diaryKey && (
              <p className="text-amber-600 text-sm">
                Note: This will replace your current diary key for this session.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsKeyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveDiaryKey}
              disabled={!keyInput}
              className="bg-diary-primary hover:bg-diary-secondary"
            >
              Save Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default DiaryHeader;
