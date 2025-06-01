
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import CarCard from '@/components/CarCard';
import FilterControls from '@/components/FilterControls';
import type { Car, CarFilters } from '@/types';
import { useCars } from '@/contexts/CarContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { List, LayoutGrid, Filter as FilterIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

const ITEMS_PER_PAGE = 9;

export default function HomePage() {
  const { cars, loading: carsLoading } = useCars();
  const [filters, setFilters] = useState<CarFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      const { make, priceRange, condition, searchTerm } = filters;
      if (make && car.make !== make) return false;
      if (condition && car.condition !== condition) return false;
      if (priceRange) {
        if (car.price < priceRange[0] || car.price > priceRange[1]) return false;
      }
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        if (
          !car.make.toLowerCase().includes(lowerSearchTerm) &&
          !car.model.toLowerCase().includes(lowerSearchTerm) &&
          !(car.features || []).join(' ').toLowerCase().includes(lowerSearchTerm) &&
          !(car.description || '').toLowerCase().includes(lowerSearchTerm)
        ) return false;
      }
      return true;
    });
  }, [cars, filters]);

  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCars.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCars, currentPage]);

  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);

  const handleFilterChange = useCallback((newFilters: CarFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  }, [setFilters, setCurrentPage]); // setFilters and setCurrentPage are stable

  if (carsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        <div className="hidden md:block">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const FilterControlsContent = <FilterControls initialFilters={filters} onFilterChange={handleFilterChange} />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
      {/* Desktop Filters */}
      <aside className="hidden lg:block sticky top-24">
        <h2 className="text-xl font-semibold mb-4 font-headline">Filters</h2>
        {FilterControlsContent}
      </aside>

      {/* Mobile Filter Button & Sheet */}
      <div className="lg:hidden mb-6">
        <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <FilterIcon className="mr-2 h-4 w-4" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
             <div className="p-4">
                <h2 className="text-xl font-semibold mb-4 font-headline">Filters</h2>
                {FilterControlsContent}
                <SheetClose asChild>
                    <Button className="w-full mt-4 bg-accent">Apply Filters</Button>
                </SheetClose>
             </div>
          </SheetContent>
        </Sheet>
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-headline">Available Cars ({filteredCars.length})</h1>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} aria-label="Grid view">
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} aria-label="List view">
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {paginatedCars.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {paginatedCars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No Cars Found</h2>
            <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <Button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
