import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaymentCancelled() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50">
      <h1 className="text-3xl font-bold text-yellow-700 mb-4">Payment Cancelled</h1>
      <p className="mb-6 text-lg text-yellow-800">Your payment was cancelled. No money was taken.</p>
      <button
        className="px-6 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-800"
        onClick={() => navigate('/')}
      >
        Return to Shop
      </button>
    </div>
  );
}
