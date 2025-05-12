
import React, { useState, useEffect } from "react";
import { useDiary } from "@/context/DiaryContext";
import DiaryHeader from "@/components/diary/DiaryHeader";
import DiaryEntryCard from "@/components/diary/DiaryEntryCard";
import DiaryEntryForm from "@/components/diary/DiaryEntryForm";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Search, CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Diary: React.FC = () => {
  const location = useLocation();
  const { 
    filteredEntries, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    searchDate,
    setSearchDate,
    clearSearch,
    currentPage,
    setCurrentPage,
    totalPages,
    entriesPerPage
  } = useDiary();
  const { diaryKey, hasSavedDiaryKey } = useAuth();
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  
  // Check if we're coming from detail page with edit request
  useEffect(() => {
    if (location.state?.editEntryId) {
      setEditingEntryId(location.state.editEntryId);
      setIsAddingEntry(false);
      // Clear the state after we use it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleNewEntry = () => {
    setIsAddingEntry(true);
    setEditingEntryId(null);
  };

  const handleEditEntry = (id: string) => {
    setEditingEntryId(id);
    setIsAddingEntry(false);
  };

  const handleCancelForm = () => {
    setIsAddingEntry(false);
    setEditingEntryId(null);
  };

  // Get paginated entries
  const paginatedEntries = React.useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredEntries.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredEntries, currentPage, entriesPerPage]);
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pagination with ellipsis
      const leftSide = Math.floor(maxPagesToShow / 2);
      const rightSide = maxPagesToShow - leftSide - 1;
      
      if (currentPage > leftSide && currentPage < totalPages - rightSide) {
        // Middle case
        pages.push(1); // Always show first page
        pages.push(-1); // Ellipsis
        
        // Pages around current
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        
        pages.push(-2); // Ellipsis
        pages.push(totalPages); // Always show last page
      } else if (currentPage <= leftSide) {
        // Near start
        for (let i = 1; i <= maxPagesToShow - 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(totalPages);
      } else {
        // Near end
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = totalPages - maxPagesToShow + 2; i <= totalPages; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-diary-light flex flex-col">
      <DiaryHeader onNewEntry={handleNewEntry} />
      
      <main className="flex-1 container mx-auto py-6 px-4">
        {!diaryKey && filteredEntries.some(entry => entry.encrypted) && (
          <Alert className="bg-diary-soft/40 border-diary-primary/20 mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Some entries are encrypted. Set your diary key to access them.
            </AlertDescription>
          </Alert>
        )}

        {hasSavedDiaryKey && (
          <Alert className="bg-diary-soft/40 border-diary-primary/20 mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your diary key is saved for this session. It will be cleared when you log out.
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filter Section */}
        {!isAddingEntry && !editingEntryId && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-diary-neutral" />
              <Input
                type="text"
                placeholder="Search by title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-diary-neutral/30 focus:border-diary-primary"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-2 top-2.5 text-diary-neutral hover:text-diary-dark"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline"
                  className={cn(
                    "min-w-[200px] border-diary-neutral/30 justify-start text-left font-normal",
                    !searchDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchDate ? format(searchDate, "MMM d, yyyy") : <span>Filter by date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={searchDate ?? undefined}
                  onSelect={(date) => setSearchDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            {(searchTerm || searchDate) && (
              <Button 
                variant="ghost" 
                onClick={clearSearch}
                className="text-diary-neutral hover:text-diary-dark hover:bg-diary-soft/30"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {(isAddingEntry || editingEntryId) ? (
          <DiaryEntryForm
            onCancel={handleCancelForm}
            entryId={editingEntryId || undefined}
          />
        ) : (
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-diary-primary border-r-transparent align-[-0.125em]"></div>
                <p className="mt-2 text-diary-neutral">Loading your diary...</p>
              </div>
            ) : paginatedEntries.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {paginatedEntries.map((entry) => (
                    <DiaryEntryCard
                      key={entry.id}
                      id={entry.id}
                      title={entry.title}
                      encrypted={entry.encrypted}
                      createdAt={entry.createdAt}
                      updatedAt={entry.updatedAt}
                      onEdit={() => handleEditEntry(entry.id)}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {getPageNumbers().map((pageNum, i) => {
                        if (pageNum === -1 || pageNum === -2) {
                          return (
                            <PaginationItem key={`ellipsis-${i}`}>
                              <span className="flex h-9 w-9 items-center justify-center">
                                ...
                              </span>
                            </PaginationItem>
                          );
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNum);
                              }}
                              isActive={pageNum === currentPage}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <div className="text-center py-12 diary-page rounded-lg border border-diary-neutral/10 bg-white/80 shadow-sm">
                <div className="mx-auto h-16 w-16 rounded-full bg-diary-soft/70 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-diary-secondary" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-diary-dark mb-2">
                  {searchTerm || searchDate ? "No matches found" : "Your Diary is Empty"}
                </h3>
                <p className="text-diary-neutral mb-6 max-w-md mx-auto">
                  {searchTerm || searchDate 
                    ? "Try different search terms or clear filters to see all entries."
                    : "Start writing your thoughts, feelings, and memories in this secure space."}
                </p>
                {searchTerm || searchDate ? (
                  <Button 
                    onClick={clearSearch}
                    variant="outline"
                    className="mr-2"
                  >
                    Clear filters
                  </Button>
                ) : null}
                <Button 
                  onClick={handleNewEntry}
                  className="bg-diary-primary hover:bg-diary-secondary"
                >
                  {searchTerm || searchDate ? "Write a new entry" : "Write Your First Entry"}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Diary;
