'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AvailableForm } from '@/types';
import { getAvailableFormRoute } from '@/page-modules/forms/services/formRoutes';

interface Props {
  forms: AvailableForm[];
}

const FormCard: React.FC<{ 
  form: AvailableForm; 
  onStart?: (form: AvailableForm) => void;
  isAssigning?: boolean;
}> = ({ form, onStart, isAssigning = false }) => {
  const router = useRouter();

  const handleOpen = () => {
    if (onStart && !isAssigning) {
      onStart(form);
    } else if (!onStart) {
      // Try to navigate to form if route exists
      const formRoute = getAvailableFormRoute(form.id);
      router.push(formRoute);
    }
  };

  return (
    <div className="group bg-white border border-neutral-100 rounded-md p-5 hover:border-primary-200 hover:shadow-card transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-10">
      <div className="flex-shrink-0 md:w-1/4">
        <h3 className="text-[15px] font-bold text-neutral-900 group-hover:text-primary-600 transition-colors tracking-tight">
          {form.name}
        </h3>
      </div>
      <div className="flex-1">
        <p className="text-[13px] text-neutral-600 font-normal leading-relaxed">
          {form.description}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <button 
          onClick={handleOpen}
          disabled={isAssigning}
          className={`px-5 py-1.5 border border-primary-500 rounded-md text-[11px] font-semibold text-primary-500 hover:bg-primary-50 transition-all active:scale-95 uppercase tracking-wide ${
            isAssigning ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isAssigning ? 'Assigning...' : 'Assign Form'}
        </button>
      </div>
    </div>
  );
};

const AvailableForms: React.FC<Props> = ({ forms }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<AvailableForm | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartForm = async (form: AvailableForm) => {
    setSelectedForm(form);
    setIsAssigning(true);
    setError(null);

    try {
      const response = await fetch('/api/forms/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: form.id }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - refresh and redirect
        router.refresh();
        setTimeout(() => {
          window.location.href = '/';
        }, 300);
      } else {
        // Show error message
        setError(data.error || 'Failed to assign form. Please try again.');
        console.error('Error assigning form:', data);
      }
    } catch (error) {
      console.error('Error assigning form:', error);
      setError('An error occurred while assigning the form. Please try again.');
    } finally {
      setIsAssigning(false);
      // Don't clear selectedForm immediately - keep it for error display
      if (!error) {
        setSelectedForm(null);
      }
    }
  };

  const visibleForms = forms.slice(0, 5);

  return (
    <>
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Additional Requests</h2>
          <p className="text-sm text-neutral-600 font-normal">Complete these forms to progress through your enrollment.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-900 mb-1">Assignment Failed</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                setSelectedForm(null);
              }}
              className="flex-shrink-0 text-red-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {forms.length === 0 ? (
          <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-md p-12 text-center">
            <p className="text-neutral-500 font-medium">No available forms at this time.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleForms.map((form) => (
              <FormCard 
                key={form.id} 
                form={form} 
                onStart={handleStartForm}
                isAssigning={isAssigning && selectedForm?.id === form.id}
              />
            ))}
          </div>
        )}
        {forms.length > 5 && (
          <div className="mt-8 flex justify-center">
             <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-2.5 border border-neutral-200 rounded-md text-[11px] font-semibold text-neutral-900 hover:border-neutral-400 hover:bg-white transition-all active:scale-95 shadow-card uppercase tracking-widest"
             >
               View more
             </button>
          </div>
        )}
      </section>

      {/* Full Modal for Additional Requests */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/10 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-md shadow-modal w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-neutral-100">
            <div className="p-8 border-b border-neutral-50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Additional Requests</h2>
                <p className="text-sm text-neutral-500 font-normal">Choose a module to complete your profile.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-md text-neutral-400 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex flex-col gap-3 bg-neutral-50/30">
              {forms.map((form) => (
                <FormCard 
                  key={form.id} 
                  form={form} 
                  onStart={handleStartForm}
                  isAssigning={isAssigning && selectedForm?.id === form.id}
                />
              ))}
            </div>
            <div className="p-6 border-t border-neutral-100 flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="bg-primary-500 text-white px-10 py-3 rounded-md font-semibold text-[12px] hover:bg-primary-600 transition-all shadow-elevated uppercase tracking-widest">Close List</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AvailableForms;
