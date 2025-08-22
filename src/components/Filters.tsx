import { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import { Filters } from '../types';

interface FiltersComponentProps {
  filters: Filters;
  onFilterChange: (filters: any) => void;
  availableFilters: {
    categories?: string[];
    sizes?: string[];
    colors?: string[];
    collections?: string[];
    maxPrice?: number;
  };
  onApplyFilters?: () => void;
}

export default function FiltersComponent({ 
  filters = {}, 
  onFilterChange, 
  availableFilters = {},
  onApplyFilters 
}: FiltersComponentProps) {
  const [tempFilters, setTempFilters] = useState<Filters>({
    category: typeof filters.category === 'string' ? filters.category : '',
    priceRange: filters.priceRange || [0, 1000],
    size: typeof filters.size === 'string' ? filters.size : '',
    sortBy: filters.sortBy || 'name',
    gender: Array.isArray(filters.gender) ? [...filters.gender] : [],
    color: Array.isArray(filters.color) ? [...filters.color] : [],
    collection: Array.isArray(filters.collection) ? [...filters.collection] : []
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const safeFilters: Filters = {
      category: typeof filters.category === 'string' ? filters.category : '',
      priceRange: filters.priceRange || [0, 1000],
      size: typeof filters.size === 'string' ? filters.size : '',
      sortBy: filters.sortBy || 'name',
      gender: Array.isArray(filters.gender) ? [...filters.gender] : [],
      color: Array.isArray(filters.color) ? [...filters.color] : [],
      collection: Array.isArray(filters.collection) ? [...filters.collection] : []
    };
    setTempFilters(safeFilters);
    setHasChanges(false);
  }, [filters]);

  useEffect(() => {
    const filtersChanged = JSON.stringify(tempFilters) !== JSON.stringify({
      category: typeof filters.category === 'string' ? filters.category : '',
      priceRange: filters.priceRange || [0, 1000],
      size: typeof filters.size === 'string' ? filters.size : '',
      sortBy: filters.sortBy || 'name',
      gender: Array.isArray(filters.gender) ? [...filters.gender] : [],
      color: Array.isArray(filters.color) ? [...filters.color] : [],
      collection: Array.isArray(filters.collection) ? [...filters.collection] : []
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
    const resetFilters: Filters = {
      category: '',
      priceRange: [0, 1000] as [number, number],
      size: '',
      sortBy: 'name',
      gender: [],
      color: [],
      collection: []
    };
    setTempFilters(resetFilters);
    onFilterChange(resetFilters);
    setHasChanges(false);
  };

  // Ensure values are always strings for select elements
  // Make sure values are always strings, never undefined
  const categoryValue = tempFilters.category !== undefined && tempFilters.category !== null ? String(tempFilters.category) : '';
  const sizeValue = tempFilters.size !== undefined && tempFilters.size !== null ? String(tempFilters.size) : '';
  const sortByValue = tempFilters.sortBy !== undefined && tempFilters.sortBy !== null ? String(tempFilters.sortBy) : 'name';

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
            onChange={(e) => handleTempFilterChange('category', e.target.value === '' ? '' : e.target.value)}
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
            onChange={(e) => handleTempFilterChange('size', e.target.value === '' ? '' : e.target.value)}
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
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
              <input
                type="number"
                placeholder="Min"
                value={tempFilters.priceRange?.[0] || ''}
                onChange={(e) => {
                  const min = e.target.value ? parseInt(e.target.value) : 0;
                  const max = tempFilters.priceRange?.[1] || 10000;
                  handleTempFilterChange('priceRange', [min, max]);
                }}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
              <input
                type="number"
                placeholder="Max"
                value={tempFilters.priceRange?.[1] || ''}
                onChange={(e) => {
                  const max = e.target.value ? parseInt(e.target.value) : 10000;
                  const min = tempFilters.priceRange?.[0] || 0;
                  handleTempFilterChange('priceRange', [min, max]);
                }}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Display current range */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              R{tempFilters.priceRange?.[0] || 0} - R{tempFilters.priceRange?.[1] || 1000}
            </span>
            <button
              onClick={() => handleTempFilterChange('priceRange', [0, 1000])}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={sortByValue}
          onChange={(e) => handleTempFilterChange('sortBy', e.target.value === '' ? 'name' : e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="name">Name (A-Z)</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Active Filters Summary */}
      {(filters.category || filters.size || (filters.priceRange && Array.isArray(filters.priceRange))) && (
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
            {filters.priceRange && Array.isArray(filters.priceRange) && filters.priceRange.length === 2 && (
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

      {/* Apply Filters Button */}
      <div className="pt-4">
        <button
          onClick={hasChanges ? applyFilters : onApplyFilters ? onApplyFilters : () => {}}
          disabled={!hasChanges && !onApplyFilters}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
            hasChanges ? 'bg-black text-white hover:bg-gray-800' : onApplyFilters ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {hasChanges ? 'Apply Filters' : 'Filters Applied'}
        </button>
      </div>
    </div>
  );
}