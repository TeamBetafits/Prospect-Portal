'use client';

import React, { useState } from 'react';
import { DOCUMENT_TYPES } from '@/constants/documentTypes';

export interface UploadedDocument {
    file: File;
    documentType: string;
}

interface AddDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (doc: UploadedDocument) => void;
}

export default function AddDocumentModal({ isOpen, onClose, onSubmit }: AddDocumentModalProps) {
    const [docType, setDocType] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setError('');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(Array.from(e.dataTransfer.files)[0]);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        if (e.target.files && e.target.files.length > 0) {
            setFile(Array.from(e.target.files)[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please upload a document.');
            return;
        }
        onSubmit({ file, documentType: docType || 'General' });
        
        // Reset
        setDocType('');
        setFile(null);
        setError('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden relative">
                {/* Close Button top right */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-8 md:p-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Document Type */}
                        <div>
                            <label className="block text-sm font-medium text-[#4A5568] mb-1.5 flex gap-1">
                                Document Type
                            </label>
                            <select
                                value={docType}
                                onChange={(e) => setDocType(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white text-gray-800"
                            >
                                <option value="">Select a document type...</option>
                                {DOCUMENT_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Upload Zone */}
                        <div>
                            <p className="text-sm text-gray-700 mb-2 font-medium">
                                To make sure everything is processed correctly, please upload <b>one document at a time.</b> You can submit additional documents right after
                            </p>
                            
                            <div 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleFileDrop}
                                className={`border-2 border-dashed rounded-lg p-10 text-center hover:bg-gray-50 transition-colors ${error ? 'border-red-400' : 'border-gray-300'}`}
                            >
                                <div className="flex justify-center mb-2">
                                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                    </svg>
                                </div>
                                {!file ? (
                                    <p className="text-gray-600 font-medium">
                                        Drag & drop a file or 
                                        <label className="text-blue-500 underline cursor-pointer ml-1">
                                            browse
                                            <input type="file" className="hidden" onChange={handleFileChange} />
                                        </label>
                                    </p>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <p className="text-green-600 font-bold">{file.name}</p>
                                        <button type="button" onClick={() => setFile(null)} className="text-red-500 text-sm hover:underline mt-2">Remove file</button>
                                    </div>
                                )}
                            </div>
                            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-8 border-t border-gray-100 pt-4 flex justify-between items-center text-xs text-gray-400">
                        <span>Never share passwords in forms. <a href="#" className="underline">Report malicious form</a></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
