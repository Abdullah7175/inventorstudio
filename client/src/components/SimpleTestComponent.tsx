import React from 'react';

export default function SimpleTestComponent() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Client Portal Test
        </h1>
        <p className="text-xl text-gray-600">
          If you can see this, the redirect worked!
        </p>
        <p className="text-sm text-gray-500 mt-4">
          This is a simple test component to verify routing works.
        </p>
      </div>
    </div>
  );
}
