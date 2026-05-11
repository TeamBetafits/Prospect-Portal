'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

const DOCUMENT_TYPES = [
    'Benefit Guide',
    'SBC / Plan Summaries',
    'Census',
    'Other',
] as const;

interface DocumentUploadProps {
    onUploadComplete?: () => void;
    buttonLabel?: string;
    buttonClassName?: string;
}

const DEFAULT_BUTTON_CLASS =
    'flex items-center gap-2 bg-primary-50 text-primary-700 border border-primary-100 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-primary-100 transition-colors shadow-card active:scale-95';

export default function DocumentUpload({ onUploadComplete, buttonLabel = 'Upload', buttonClassName }: DocumentUploadProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState<string>(DOCUMENT_TYPES[0]);
    const [documentTitle, setDocumentTitle] = useState('');
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
            setDocumentTitle(file.name.replace(/\.[^/.]+$/, '') || file.name);
            setError('');
            setSuccess(false);
            setIsModalOpen(true);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('name', selectedFile.name);
            formData.append('documentType', documentType);
            formData.append('documentTitle', documentTitle.trim() || selectedFile.name);

            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                if (data.fileId && data.fileUrl) {
                    console.log('[DocumentUpload] File uploaded successfully. FileId:', data.fileId, 'FileUrl:', data.fileUrl);
                }
                setTimeout(() => {
                    setIsModalOpen(false);
                    setSelectedFile(null);
                    setDocumentTitle('');
                    setDocumentType(DOCUMENT_TYPES[0]);
                    setSuccess(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    router.refresh();
                    if (onUploadComplete) onUploadComplete();
                }, 1800);
            } else {
                setError(data.error || 'Failed to upload document');
            }
        } catch (err) {
            setError('An error occurred while uploading. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={buttonClassName || DEFAULT_BUTTON_CLASS}
            >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {buttonLabel}
            </button>

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
            />

            {/* Upload Modal */}
            {isModalOpen && selectedFile && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-md max-w-md w-full p-6 shadow-modal">
                        <h3 className="text-lg font-bold text-neutral-900 mb-4">Upload Document</h3>
                        
                        {success ? (
                            <div className="py-6 text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-base font-semibold text-neutral-900">Document uploaded successfully</p>
                                <p className="text-sm text-neutral-500 mt-1">It will appear in your list shortly.</p>
                            </div>
                        ) : (
                            <>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">Document type</label>
                            <select
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                className="w-full px-4 py-2.5 border border-neutral-200 rounded-md text-neutral-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                {DOCUMENT_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">Document title</label>
                            <input
                                type="text"
                                value={documentTitle}
                                onChange={(e) => setDocumentTitle(e.target.value)}
                                placeholder="e.g. Q4 Benefit Guide"
                                className="w-full px-4 py-2.5 border border-neutral-200 rounded-md text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">File</label>
                            <div className="px-4 py-3 bg-neutral-50 rounded-md border border-neutral-200 text-neutral-900">
                                {selectedFile.name}
                            </div>
                            <p className="text-xs text-neutral-500 mt-2">
                                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedFile(null);
                                    setError('');
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                                disabled={uploading}
                                className="px-4 py-2 border border-neutral-200 rounded-md text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="px-4 py-2 bg-[#97C25E] hover:bg-[#8bb356] text-white rounded-md text-[13px] font-semibold shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
