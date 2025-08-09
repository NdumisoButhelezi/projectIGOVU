import React, { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';

interface FiltersComponentProps {
  filters: {
    category?: string;
    priceRange?: [number, number];
    size?: string;
    sortBy?: string;
  };
  onFilterChange: (filters: any) => void;
  availableFilters: {
    categories?: string[];
    sizes?: string[];
  };
  onApplyFilters?: () => void;
}

export default function FiltersComponent({ 
  filters = {}, 
  onFilterChange, 
  availableFilters = {},
  onApplyFilters 
}: FiltersComponentProps) {
  const [tempFilters, setTempFilters] = useState({
    category: filters.category || '',
    priceRange: filters.priceRange || [0, 1000],
    size: filters.size || '',
    sortBy: filters.sortBy || 'name'
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const safeFilters = {
      category: filters.category || '',
      priceRange: filters.priceRange || [0, 1000],
      size: filters.size || '',
      sortBy: filters.sortBy || 'name'
    };
    setTempFilters(safeFilters);
    setHasChanges(false);
  }, [filters]);

  useEffect(() => {
    const filtersChanged = JSON.stringify(tempFilters) !== JSON.stringify({
      category: filters.category || '',
      priceRange: filters.priceRange || [0, 1000],
      size: filters.size || '',
      sortBy: filters.sortBy || 'name'
    });
    setHasChanges(filtersChanged);
  }, [tempFilters, filters]);

  const handleTempFilterChange = (key: string, value: any) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    onFilterChange(tempFilters);
    if (onApplyFilters) {
      onApplyFilters();
    }
    setHasChanges(false);
  };

  const resetFilters = () => {
    const resetFilters = {
      category: '',
      priceRange: [0, 1000] as [number, number],
      size: '',
      sortBy: 'name'
    };
    setTempFilters(resetFilters);
    onFilterChange(resetFilters);
    setHasChanges(false);
  };

  // Ensure values are always strings for select elements
  const categoryValue = tempFilters.category || '';
  const sizeValue = tempFilters.size || '';
  const sortByValue = tempFilters.sortBy || 'name';

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h3>
        <button
          onClick={resetFilters}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="relative">
          <select
            value={categoryValue}
            onChange={(e) => handleTempFilterChange('category', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="">All Categories</option>
            {availableFilters.categories?.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {filters.category && (
            <button
              onClick={() => handleTempFilterChange('category', '')}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Size
        </label>
        <div className="relative">
          <select
            value={sizeValue}
            onChange={(e) => handleTempFilterChange('size', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="">All Sizes</option>
            {availableFilters.sizes?.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          {filters.size && (
            <button
              onClick={() => handleTempFilterChange('size', '')}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange?.[0] || ''}
              onChange={(e) => {
                const min = e.target.value ? parseInt(e.target.value) : 0;
                const max = filters.priceRange?.[1] || 10000;
                handleTempFilterChange('priceRange', [min, max]);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange?.[1] || ''}
              onChange={(e) => {
                const max = e.target.value ? parseInt(e.target.value) : 10000;
                const min = filters.priceRange?.[0] || 0;
                handleTempFilterChange('priceRange', [min, max]);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          {filters.priceRange && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                R{filters.priceRange[0]} - R{filters.priceRange[1]}
              </span>
              <button
                onClick={() => handleTempFilterChange('priceRange', [0, 1000])}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={sortByValue}
          onChange={(e) => handleTempFilterChange('sortBy', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="name">Name (A-Z)</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Active Filters Summary */}
      {(filters.category || filters.size || filters.priceRange) && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <span className="inline-flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full text-sm">
                {filters.category}
                <button onClick={() => handleTempFilterChange('category', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.size && (
              <span className="inline-flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full text-sm">
                Size: {filters.size}
                <button onClick={() => handleTempFilterChange('size', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.priceRange && (
              <span className="inline-flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full text-sm">
                R{filters.priceRange[0]}-R{filters.priceRange[1]}
                <button onClick={() => handleTempFilterChange('priceRange', [0, 1000])}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Apply Filters Button (for mobile) */}
      {onApplyFilters && (
        <button
          onClick={onApplyFilters}
          className="w-full bg-black text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-800 transition-all"
        >
          Apply Filters
        </button>
      )}
    </div>
  );
}