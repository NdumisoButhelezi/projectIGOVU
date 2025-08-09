import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaymentFailed() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
      <h1 className="text-3xl font-bold text-red-700 mb-4">Payment Failed</h1>
      <p className="mb-6 text-lg text-red-800">There was a problem processing your payment. Please try again or contact support.</p>
      <button
        className="px-6 py-2 bg-red-700 text-white rounded hover:bg-red-800"
        onClick={() => navigate('/')}
      >
        Return to Shop
      </button>
    </div>
  );
}
