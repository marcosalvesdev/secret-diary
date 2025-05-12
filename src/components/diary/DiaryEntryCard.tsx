
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDiary } from "@/context/DiaryContext";
import { useAuth } from "@/context/AuthContext";
import { Pen, Eye, Key, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

interface DiaryEntryCardProps {
  id: string;
  title: string;
  encrypted: boolean;
  createdAt: string;
  updatedAt: string;
  onEdit: () => void;
}

const DiaryEntryCard: React.FC<DiaryEntryCardProps> = ({
  id,
  title,
  encrypted,
  createdAt,
  updatedAt,
  onEdit,
}) => {
  const { getEntry, decryptEntry, encryptEntry } = useDiary();
  const { diaryKey } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [keyInput, setKeyInput] = React.useState("");
  const [decryptError, setDecryptError] = React.useState(false);
  const [isEncrypting, setIsEncrypting] = React.useState(false);

  const entry = getEntry(id);
  
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
    <>
      <Card className="diary-entry w-full mb-4 shadow hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-base flex items-center gap-2 text-diary-dark">
            <Link to={`/diary/${id}`} className="hover:text-diary-primary transition-colors">
              {title}
            </Link>
            {encrypted && (
              <span className="bg-diary-soft text-diary-secondary text-xs px-2 py-1 rounded-full">
                Encrypted
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          {entry && !entry.encrypted ? (
            <p className="font-mono text-sm text-diary-dark/80 whitespace-pre-wrap">
              {entry.content.length > 150
                ? `${entry.content.substring(0, 150)}...`
                : entry.content}
            </p>
          ) : (
            <p className="italic text-diary-neutral">
              {encrypted ? "This entry is encrypted" : "Click to view full entry"}
            </p>
          )}
        </CardContent>
        <CardFooter className="pt-0 flex justify-between text-xs text-diary-neutral">
          <span className="font-mono">
            {format(new Date(createdAt), "MMM d, yyyy")}
            {createdAt !== updatedAt && " (edited)"}
          </span>
          <div className="flex gap-2">
            {encrypted && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-diary-secondary border-diary-secondary/30 hover:bg-diary-soft/50"
                onClick={handleDecryptClick}
              >
                <Key className="h-3.5 w-3.5 mr-1" />
                Decrypt
              </Button>
            )}
            
            {/* New encrypt button for unencrypted entries */}
            {!encrypted && diaryKey && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-diary-secondary border-diary-secondary/30 hover:bg-diary-soft/50"
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
              className="h-8 px-2"
              onClick={onEdit}
            >
              {encrypted && !entry?.encrypted ? (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View
                </>
              ) : (
                <>
                  <Pen className="h-3.5 w-3.5 mr-1" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

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
    </>
  );
};

export default DiaryEntryCard;
