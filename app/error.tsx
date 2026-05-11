'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Root Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-red-100">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <div className="bg-red-50 p-4 rounded mb-6 overflow-auto max-h-60">
          <p className="text-red-800 font-mono text-sm whitespace-pre-wrap">
            {error.message || 'An unknown error occurred'}
          </p>
          {error.stack && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer text-red-700">View stack trace</summary>
              <pre className="text-xs mt-2 text-red-600 overflow-x-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
