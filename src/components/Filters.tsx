import React from 'react';
import { Filters as FiltersType } from '../types';
import { Sliders } from 'lucide-react';

interface FiltersProps {
  filters: FiltersType;
  onFilterChange: (newFilters: FiltersType) => void;
  availableFilters: {
    categories: string[];
    colors: string[];
    collections: string[];
    maxPrice: number;
  };
}

export default function Filters({ filters, onFilterChange, availableFilters }: FiltersProps) {
  const handleCheckboxChange = (filterType: keyof FiltersType, value: string) => {
    const currentValues = filters[filterType] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFilterChange({
      ...filters,
      [filterType]: newValues
    });
  };

  const handlePriceChange = (value: number, index: 0 | 1) => {
    const newPriceRange = [...filters.priceRange] as [number, number];
    newPriceRange[index] = value;
    onFilterChange({
      ...filters,
      priceRange: newPriceRange
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Sliders className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>

      <div>
        <h3 className="font-medium mb-2">Gender</h3>
        <div className="space-y-2">
          {['men', 'women'].map(gender => (
            <label key={gender} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.gender.includes(gender)}
                onChange={() => handleCheckboxChange('gender', gender)}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="capitalize">{gender}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Categories</h3>
        <div className="space-y-2">
          {availableFilters.categories.map(category => (
            <label key={category} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.category.includes(category)}
                onChange={() => handleCheckboxChange('category', category)}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Collections</h3>
        <div className="space-y-2">
          {availableFilters.collections.map(collection => (
            <label key={collection} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.collection.includes(collection)}
                onChange={() => handleCheckboxChange('collection', collection)}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span>{collection}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Colors</h3>
        <div className="space-y-2">
          {availableFilters.colors.map(color => (
            <label key={color} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.color.includes(color)}
                onChange={() => handleCheckboxChange('color', color)}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span>{color}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Price Range</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Min Price: ${filters.priceRange[0]}</label>
            <input
              type="range"
              min={0}
              max={availableFilters.maxPrice}
              value={filters.priceRange[0]}
              onChange={(e) => handlePriceChange(Number(e.target.value), 0)}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Max Price: ${filters.priceRange[1]}</label>
            <input
              type="range"
              min={0}
              max={availableFilters.maxPrice}
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceChange(Number(e.target.value), 1)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}