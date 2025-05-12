
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDiary } from "@/context/DiaryContext";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface DiaryEntryFormProps {
  onCancel: () => void;
  entryId?: string;
}

const DiaryEntryForm: React.FC<DiaryEntryFormProps> = ({ onCancel, entryId }) => {
  const { getEntry, createEntry, updateEntry, deleteEntry } = useDiary();
  const { diaryKey, hasSavedDiaryKey } = useAuth();
  
  const entry = entryId ? getEntry(entryId) : undefined;
  
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  const [encrypt, setEncrypt] = useState(entry ? entry.encrypted : hasSavedDiaryKey);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isEditing = !!entryId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing) {
        await updateEntry(entryId, title, content);
      } else {
        await createEntry(title, content, encrypt);
      }
      onCancel();
    } catch (error) {
      // Error handling is done in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entryId) return;
    
    setIsLoading(true);
    try {
      await deleteEntry(entryId);
      setShowDeleteDialog(false);
      onCancel();
    } catch (error) {
      // Error handling is done in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full animate-fade-in">
        <CardHeader>
          <CardTitle className="font-serif font-bold text-3xl text-diary-primary">
            {isEditing ? "Edit Diary Entry" : "New Diary Entry"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Entry title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
                className="border-diary-neutral/30 focus:border-diary-primary font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Dear diary..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="min-h-[200px] border-diary-neutral/30 focus:border-diary-primary font-mono"
              />
            </div>

            {!isEditing && (
              <div className="flex items-center space-x-2 mt-6">
                <input
                  id="encrypt"
                  type="checkbox"
                  checked={encrypt}
                  onChange={() => setEncrypt(!encrypt)}
                  disabled={!diaryKey}
                  className="h-4 w-4 rounded border-diary-neutral/30 text-diary-primary focus:ring-diary-primary"
                />
                <Label 
                  htmlFor="encrypt" 
                  className={`text-sm ${!diaryKey ? 'text-gray-400' : ''}`}
                >
                  Encrypt this entry
                  {!diaryKey && " (requires diary key)"}
                </Label>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  className="mr-auto"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !title || !content}
                className="bg-diary-primary hover:bg-diary-secondary"
              >
                {isLoading ? "Saving..." : isEditing ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DiaryEntryForm;
