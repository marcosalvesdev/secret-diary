import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDiary } from "@/context/DiaryContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Pen, Key } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const DiaryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEntry, decryptEntry, encryptEntry } = useDiary();
  const { diaryKey } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [keyInput, setKeyInput] = React.useState("");
  const [decryptError, setDecryptError] = React.useState(false);
  const [isEncrypting, setIsEncrypting] = React.useState(false);
  
  if (!id) {
    navigate("/");
    return null;
  }
  
  const entry = getEntry(id);
  
  if (!entry) {
    navigate("/");
    return null;
  }
  
  const handleBack = () => {
    navigate("/");
  };
  
  const handleEdit = () => {
    navigate("/", { state: { editEntryId: id } });
  };
  
  const handleDecryptClick = () => {
    // If we already have a diary key, try to decrypt directly
    if (diaryKey) {
      const success = decryptEntry(id, diaryKey);
      if (!success) {
        setDecryptError(true);
        setIsDialogOpen(true);
      }
    } else {
      // Otherwise, open the dialog to ask for the key
      setIsDialogOpen(true);
    }
  };

  const handleDecryptSubmit = () => {
    const success = decryptEntry(id, keyInput);
    if (success) {
      setKeyInput("");
      setDecryptError(false);
      setIsDialogOpen(false);
    } else {
      setDecryptError(true);
    }
  };
  
  const handleEncryptClick = async () => {
    setIsEncrypting(true);
    try {
      await encryptEntry(id);
    } finally {
      setIsEncrypting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-diary-light">
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Diary
          </Button>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-sm text-diary-dark font-mono font-bold">
                {entry.title}
                {entry.encrypted && (
                  <span className="ml-2 bg-diary-soft text-diary-secondary text-xs px-2 py-1 rounded-full">
                    Encrypted
                  </span>
                )}
              </h1>
              <div className="flex gap-2">
                {entry.encrypted && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-2 text-diary-secondary border-diary-secondary/30 hover:bg-diary-soft/50"
                    onClick={handleDecryptClick}
                  >
                    <Key className="h-3.5 w-3.5 mr-1" />
                    Decrypt
                  </Button>
                )}
                
                {!entry.encrypted && diaryKey && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-2 text-diary-secondary border-diary-secondary/30 hover:bg-diary-soft/50"
                    onClick={handleEncryptClick}
                    disabled={isEncrypting}
                  >
                    <Lock className="h-3.5 w-3.5 mr-1" />
                    {isEncrypting ? "Encrypting..." : "Encrypt"}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEdit}
                  className="h-9"
                >
                  <Pen className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
            
            <div className="mb-6">
              {!entry.encrypted ? (
                <div className="whitespace-pre-wrap bg-diary-light/50 p-4 rounded-md font-mono">
                  {entry.content}
                </div>
              ) : (
                <div className="italic text-diary-neutral text-center py-8">
                  This entry is encrypted
                </div>
              )}
            </div>
            
            <div className="text-sm font-mono text-diary-neutral">
              Created: {format(new Date(entry.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              {entry.createdAt !== entry.updatedAt && (
                <div>
                  Updated: {format(new Date(entry.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Decrypt Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Diary Key</DialogTitle>
            <DialogDescription>
              You need your diary key to decrypt this entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter your diary key"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setDecryptError(false);
              }}
              className="font-mono"
            />
            {decryptError && (
              <p className="text-destructive text-sm">
                Wrong key. Please try again.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDecryptSubmit}
              className="bg-diary-primary hover:bg-diary-secondary"
              disabled={!keyInput}
            >
              Decrypt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiaryDetail;
