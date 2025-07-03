"use client";

import type { CarFilters, CarCondition } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CAR_MAKES, CAR_CONDITIONS, DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE } from '@/lib/constants';
import { Slider } from '@/components/ui/slider';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface FilterControlsProps {
  initialFilters?: CarFilters;
  onFilterChange: (filters: CarFilters) => void;
}

export default function FilterControls({ initialFilters = {}, onFilterChange }: FilterControlsProps) {
  const [make, setMake] = useState(initialFilters.make || '');
  const [condition, setCondition] = useState<CarCondition | ''>(initialFilters.condition || '');
  const [priceRange, setPriceRange] = useState<[number, number]>(initialFilters.priceRange || [DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || '');
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => setBrands(data || []));
  }, []);

  useEffect(() => {
    // Debounce or directly call onFilterChange
    const filters: CarFilters = {};
    if (make) filters.make = make;
    if (condition) filters.condition = condition;
    if (priceRange[0] !== DEFAULT_MIN_PRICE || priceRange[1] !== DEFAULT_MAX_PRICE) filters.priceRange = priceRange;
    if (searchTerm) filters.searchTerm = searchTerm;

    onFilterChange(filters);
  }, [make, condition, priceRange, searchTerm, onFilterChange]);

  const handleResetFilters = () => {
    setMake('');
    setCondition('');
    setPriceRange([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);
    setSearchTerm('');
    onFilterChange({});
  };

  const hasActiveFilters = make || condition || searchTerm || (priceRange[0] !== DEFAULT_MIN_PRICE || priceRange[1] !== DEFAULT_MAX_PRICE);

  return (
    <div className="p-4 space-y-6 bg-card rounded-lg shadow">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search make, model, features..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      <div>
        <Label htmlFor="make-select" className="block mb-1 font-medium">Make</Label>
        <Select value={make} onValueChange={setMake}>
          <SelectTrigger id="make-select">
            <SelectValue placeholder="Any Make" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="condition-select" className="block mb-1 font-medium">Condition</Label>
        <Select value={condition} onValueChange={(value) => setCondition(value as CarCondition | '')}>
          <SelectTrigger id="condition-select">
            <SelectValue placeholder="Any Condition" />
          </SelectTrigger>
          <SelectContent>
            {CAR_CONDITIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="block mb-1 font-medium">Price Range</Label>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>${priceRange[0].toLocaleString()}</span>
          <span>${priceRange[1].toLocaleString()}</span>
        </div>
        <Slider
          min={DEFAULT_MIN_PRICE}
          max={DEFAULT_MAX_PRICE}
          step={1000}
          value={priceRange}
          onValueChange={(newRange) => setPriceRange(newRange as [number, number])}
          className="w-full"
        />
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={handleResetFilters} className="w-full">
          <X className="mr-2 h-4 w-4" /> Reset Filters
        </Button>
      )}
    </div>
  );
}
