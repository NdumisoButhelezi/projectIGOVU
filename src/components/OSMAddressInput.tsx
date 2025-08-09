import { useState, useEffect } from 'react';

interface OSMAddressInputProps {
  value: string;
  onSelect: (address: any) => void;
}

interface AddressSuggestion {
  properties: {
    formatted: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    postcode?: string;
    country_code?: string;
    lat?: number;
    lon?: number;
  };
}

export default function OSMAddressInput({ value, onSelect }: OSMAddressInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const fetchSuggestions = async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Try multiple endpoints with fallbacks
      const endpoints = [
        `/api/geocode?text=${encodeURIComponent(text)}&limit=5&lang=en`,
        `https://project-igovu.vercel.app/api/geocode?text=${encodeURIComponent(text)}&limit=5&lang=en`,
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&limit=5`
      ];
      
      // Try each endpoint until one works
      let data;
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying geocode endpoint: ${endpoint}`);
          const response = await fetch(endpoint, { 
            headers: endpoint.includes('nominatim') ? { 
              'User-Agent': 'IGOVU-App/1.0' // Required for Nominatim
            } : {} 
          });
          
          if (response.ok) {
            if (endpoint.includes('nominatim')) {
              // Process Nominatim format
              const nominatimData = await response.json();
              data = {
                features: nominatimData.map((item: any) => ({
                  properties: {
                    formatted: item.display_name,
                    address_line1: item.display_name.split(',')[0],
                    city: item.address?.city || item.address?.town || '',
                    postcode: item.address?.postcode || '',
                    country_code: item.address?.country_code || '',
                    lat: parseFloat(item.lat),
                    lon: parseFloat(item.lon)
                  }
                }))
              };
              console.log('Using Nominatim data', data);
              break;
            } else {
              // Regular Geoapify format
              data = await response.json();
              console.log('Using geocode API data', data);
              break;
            }
          }
        } catch (endpointError) {
          console.warn(`Endpoint ${endpoint} failed:`, endpointError);
          // Continue to next endpoint
        }
      }
      
      if (data?.features) {
        setSuggestions(data.features);
      } else {
        // Fallback to manual suggestion
        setSuggestions([{
          properties: {
            formatted: text,
            address_line1: text,
            city: 'Durban',
            postcode: '4000',
            country_code: 'ZA',
            lat: -29.8587,
            lon: 31.0218
          }
        }]);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback to at least one suggestion so the user can continue
      setSuggestions([{
        properties: {
          formatted: text,
          address_line1: text,
          city: 'Durban',
          postcode: '4000',
          country_code: 'ZA',
          lat: -29.8587,
          lon: 31.0218
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    
    // Debounce the API call
    const timeoutId = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setInputValue(suggestion.properties.formatted);
    setShowSuggestions(false);
    onSelect(suggestion);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Address 🏠</label>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder="Start typing your address..."
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="text-sm text-gray-900">
                {suggestion.properties.formatted}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isLoading && (
        <div className="absolute right-3 top-9 text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        </div>
      )}
    </div>
  );
}
