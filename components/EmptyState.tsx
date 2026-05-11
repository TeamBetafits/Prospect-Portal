import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = "Data Not Available", 
  message = "The data is not currently available. It will be available soon." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-dashed border-neutral-200 rounded-md animate-in fade-in duration-500">
      <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-500 max-w-xs mx-auto text-[14px]">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;
