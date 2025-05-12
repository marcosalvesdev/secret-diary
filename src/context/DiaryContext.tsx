import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from "@/components/ui/use-toast";

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  encrypted: boolean;
}

interface DiaryContextType {
  entries: DiaryEntry[];
  filteredEntries: DiaryEntry[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  entriesPerPage: number;
  searchTerm: string;
  searchDate: Date | null;
  createEntry: (title: string, content: string, encrypt: boolean) => Promise<void>;
  updateEntry: (id: string, title: string, content: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntry: (id: string) => DiaryEntry | undefined;
  decryptEntry: (id: string, key: string) => boolean;
  encryptEntry: (id: string) => Promise<boolean>;
  setSearchTerm: (term: string) => void;
  setSearchDate: (date: Date | null) => void;
  clearSearch: () => void;
  setCurrentPage: (page: number) => void;
  setEntriesPerPage: (count: number) => void;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

// Simulate encryption with Base64 for demo purposes
// In a real app, you would use a proper encryption library
const mockEncrypt = (text: string, key: string) => {
  // This is NOT real encryption - just a demo
  // Don't use this in production!
  const combined = text + key;
  return btoa(combined);
};

const mockDecrypt = (encrypted: string, key: string) => {
  try {
    // This is NOT real decryption - just a demo
    // Don't use this in production!
    const decoded = atob(encrypted);
    if (decoded.endsWith(key)) {
      return decoded.slice(0, -key.length);
    }
    return null; // Key doesn't match
  } catch (e) {
    return null; // Invalid Base64
  }
};

export const DiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, diaryKey } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const { toast } = useToast();

  // Load entries from localStorage when user changes
  useEffect(() => {
    const loadEntries = () => {
      if (!user) {
        setEntries([]);
        setIsLoading(false);
        return;
      }

      const userEntriesKey = `secretdiary_entries_${user.id}`;
      const savedEntries = localStorage.getItem(userEntriesKey);
      
      if (savedEntries) {
        try {
          setEntries(JSON.parse(savedEntries));
        } catch (e) {
          console.error('Failed to parse entries', e);
          localStorage.removeItem(userEntriesKey);
          setEntries([]);
        }
      } else {
        setEntries([]);
      }
      
      setIsLoading(false);
    };

    loadEntries();
  }, [user]);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    if (user && entries.length > 0) {
      const userEntriesKey = `secretdiary_entries_${user.id}`;
      localStorage.setItem(userEntriesKey, JSON.stringify(entries));
    }
  }, [entries, user]);

  // Filter and paginate entries
  const filteredEntries = React.useMemo(() => {
    if (!entries.length) return [];
    
    return entries.filter(entry => {
      const matchesTerm = searchTerm 
        ? entry.title.toLowerCase().includes(searchTerm.toLowerCase()) 
        : true;
      
      const matchesDate = searchDate
        ? new Date(entry.createdAt).toDateString() === searchDate.toDateString()
        : true;
        
      return matchesTerm && matchesDate;
    });
  }, [entries, searchTerm, searchDate]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / entriesPerPage));
  
  // Adjust current page if needed after filtering
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredEntries, totalPages, currentPage]);

  const clearSearch = () => {
    setSearchTerm('');
    setSearchDate(null);
  };

  const createEntry = async (title: string, content: string, encrypt: boolean) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create entries",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      let processedContent = content;
      
      // If encryption is requested, check if we have a diary key
      if (encrypt) {
        if (!diaryKey) {
          throw new Error('Diary key is required for encrypted entries');
        }
        processedContent = mockEncrypt(content, diaryKey);
      }

      const newEntry: DiaryEntry = {
        id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        title,
        content: processedContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        encrypted: encrypt,
      };

      setEntries(prev => [newEntry, ...prev]);

      toast({
        title: "Entry created",
        description: encrypt ? "Your encrypted diary entry has been saved" : "Your diary entry has been saved",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create entry",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateEntry = async (id: string, title: string, content: string) => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const entryIndex = entries.findIndex(e => e.id === id);
      if (entryIndex === -1) {
        throw new Error('Entry not found');
      }

      const entry = entries[entryIndex];
      let processedContent = content;

      // If the entry is encrypted, we need to encrypt the new content
      if (entry.encrypted) {
        if (!diaryKey) {
          throw new Error('Diary key is required to update encrypted entries');
        }
        processedContent = mockEncrypt(content, diaryKey);
      }

      const updatedEntry = {
        ...entry,
        title,
        content: processedContent,
        updatedAt: new Date().toISOString(),
      };

      const newEntries = [...entries];
      newEntries[entryIndex] = updatedEntry;

      setEntries(newEntries);

      toast({
        title: "Entry updated",
        description: "Your diary entry has been updated",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update entry",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const filteredEntries = entries.filter(e => e.id !== id);
      
      if (filteredEntries.length === entries.length) {
        throw new Error('Entry not found');
      }

      setEntries(filteredEntries);

      toast({
        title: "Entry deleted",
        description: "Your diary entry has been deleted",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete entry",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEntry = (id: string) => {
    return entries.find(e => e.id === id);
  };

  const decryptEntry = (id: string, key: string) => {
    const entry = entries.find(e => e.id === id);
    
    if (!entry || !entry.encrypted) {
      return false;
    }

    const decryptedContent = mockDecrypt(entry.content, key);
    
    if (decryptedContent === null) {
      return false;
    }

    // Update the entry locally with decrypted content, but don't save to storage
    const entryIndex = entries.findIndex(e => e.id === id);
    const updatedEntries = [...entries];
    updatedEntries[entryIndex] = {
      ...entry,
      content: decryptedContent,
      // Not really decrypted in storage, just marked for UI purposes
      encrypted: false,
    };

    setEntries(updatedEntries);
    return true;
  };

  // New function to encrypt an existing entry
  const encryptEntry = async (id: string): Promise<boolean> => {
    if (!user || !diaryKey) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You need a diary key to encrypt entries",
      });
      return false;
    }

    setIsLoading(true);

    try {
      const entryIndex = entries.findIndex(e => e.id === id);
      if (entryIndex === -1) {
        throw new Error('Entry not found');
      }

      const entry = entries[entryIndex];
      
      // Skip if already encrypted
      if (entry.encrypted) {
        return true;
      }
      
      // Encrypt the content
      const encryptedContent = mockEncrypt(entry.content, diaryKey);
      
      const updatedEntry = {
        ...entry,
        content: encryptedContent,
        encrypted: true,
        updatedAt: new Date().toISOString(),
      };

      const newEntries = [...entries];
      newEntries[entryIndex] = updatedEntry;

      setEntries(newEntries);

      toast({
        title: "Entry encrypted",
        description: "Your diary entry has been encrypted",
      });
      
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to encrypt entry",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    entries,
    filteredEntries,
    isLoading,
    currentPage,
    totalPages,
    entriesPerPage,
    searchTerm,
    searchDate,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    decryptEntry,
    encryptEntry,
    setSearchTerm,
    setSearchDate,
    clearSearch,
    setCurrentPage,
    setEntriesPerPage,
  };

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
};

export const useDiary = () => {
  const context = useContext(DiaryContext);
  if (context === undefined) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
};
