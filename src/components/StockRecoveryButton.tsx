import React from 'react';
import syncStockLevels from '../utils/stock-recovery';

// Admin UI component to trigger stock recovery
export function StockRecoveryButton() {
  return (
    <button 
      className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
      onClick={() => {
        if (window.confirm('Are you sure you want to run stock recovery? This will analyze all transactions and may update product stock levels.')) {
          syncStockLevels().catch(error => {
            console.error('Stock recovery failed:', error);
            window.alert(`Stock recovery failed: ${error.message}`);
          });
        }
      }}
    >
      Recover Stock Levels
    </button>
  );
}

export default StockRecoveryButton;
