import React, { useState, useEffect } from 'react';
import { CartItem } from '../types';

interface StockStatusProps {
  items: CartItem[];
  onStockStatusChange?: (isInStock: boolean) => void;
}

const StockStatus: React.FC<StockStatusProps> = ({ items, onStockStatusChange }) => {
  const [stockStatus, setStockStatus] = useState<Record<string, { available: number, requested: number }>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't check if no items in cart
    if (!items.length) return;
    
    const checkStock = async () => {
      setLoading(true);
      setError(null);

      try {
        // Process each item individually
        const result: Record<string, { available: number, requested: number }> = {};
        let allInStock = true;

        // For each cart item, get the current stock level
        for (const item of items) {
          try {
            // Try multiple endpoints with fallbacks
            const endpoints = [
              `/api/check-stock?productId=${item.id}`,
              `https://project-igovu.vercel.app/api/check-stock?productId=${item.id}`
            ];
            
            let stockData = null;
            
            // Try each endpoint until one works
            for (const endpoint of endpoints) {
              try {
                console.log(`Checking stock at: ${endpoint}`);
                const response = await fetch(endpoint, {
                  method: 'GET',
                  headers: { 'Content-Type': 'application/json' },
                });

                if (response.ok) {
                  stockData = await response.json();
                  console.log(`Stock data for ${item.id}:`, stockData);
                  break;
                } else {
                  console.warn(`Could not check stock at ${endpoint}: ${response.status}`);
                }
              } catch (endpointError) {
                console.warn(`Endpoint ${endpoint} failed:`, endpointError);
                // Continue to next endpoint
              }
            }
            
            if (stockData) {
              result[item.id] = { 
                available: stockData.stock || 0, 
                requested: item.quantity 
              };
              
              // Update overall stock status
              if (stockData.stock < item.quantity) {
                allInStock = false;
              }
            } else {
              // All endpoints failed, assume in stock
              console.warn(`All stock endpoints failed for ${item.id}, assuming available`);
              result[item.id] = { 
                available: Infinity, // Unknown but assume available
                requested: item.quantity 
              };
            }
          } catch (itemError) {
            console.error(`Error checking stock for ${item.id}:`, itemError);
            // Fall back to assuming in stock
            result[item.id] = { 
              available: Infinity, // Unknown but assume available 
              requested: item.quantity 
            };
          }
        }

        setStockStatus(result);
        
        // Notify parent component if callback provided
        if (onStockStatusChange) {
          onStockStatusChange(allInStock);
        }
      } catch (err) {
        setError('Could not check product availability');
        console.error('Stock check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkStock();
  }, [items, onStockStatusChange]);

  // Only render if there are items and we have stock status data
  if (!items.length || !Object.keys(stockStatus).length) return null;

  // Check if any item is out of stock or limited
  const hasOutOfStock = Object.values(stockStatus).some(
    status => status.available < status.requested
  );
  
  const hasLowStock = Object.values(stockStatus).some(
    status => status.available <= 5 && status.available >= status.requested
  );

  if (!hasOutOfStock && !hasLowStock) return null;

  return (
    <div className="mb-4">
      {loading ? (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">
          Checking product availability...
        </div>
      ) : error ? (
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
          {error}
        </div>
      ) : hasOutOfStock ? (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
          <p className="font-bold mb-1">Some items are out of stock</p>
          <ul className="text-sm">
            {Object.entries(stockStatus).map(([productId, status]) => {
              const item = items.find(i => i.id === productId);
              if (status.available < status.requested) {
                return (
                  <li key={productId}>
                    {item?.name || 'Item'}: Only {status.available} available
                    {status.available === 0 ? ' (out of stock)' : ''}
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      ) : hasLowStock ? (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
          <p className="font-bold mb-1">Limited stock available</p>
          <ul className="text-sm">
            {Object.entries(stockStatus).map(([productId, status]) => {
              const item = items.find(i => i.id === productId);
              if (status.available <= 5 && status.available >= status.requested) {
                return (
                  <li key={productId}>
                    {item?.name || 'Item'}: Only {status.available} left in stock
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default StockStatus;
