'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    FileIcon,
    Loader2,
    Plus,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { DOCUMENT_TYPES } from '@/constants/documentTypes';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png';
const ALLOWED_EXTENSIONS = /\.(pdf|doc|docx|xls|xlsx|csv|txt|jpg|jpeg|png)$/i;
const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    'image/jpeg',
    'image/png',
]);

type UploadStatus = 'Ready' | 'Uploading' | 'Uploaded' | 'Failed' | 'Unsupported' | 'Too Large';

type QueueItem = {
    id: string;
    file: File;
    title: string;
    documentType: string;
    status: UploadStatus;
    error?: string;
};

interface DocumentUploadProps {
    onUploadComplete?: () => void;
    buttonLabel?: string;
    buttonClassName?: string;
}

const DEFAULT_BUTTON_CLASS =
    'flex items-center gap-2 bg-primary-50 text-primary-700 border border-primary-100 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-primary-100 transition-colors shadow-card active:scale-95';

function getItemId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getFileTitle(fileName: string) {
    return fileName.replace(/\.[^/.]+$/, '') || fileName;
}

function formatFileSize(bytes: number) {
    if (!bytes) return '0 KB';
    const units = ['Bytes', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function inferDocumentType(fileName: string) {
    const value = fileName.toLowerCase();
    if (value.includes('benefit') && value.includes('guide')) return 'Benefit Guide';
    if (value.includes('sbc')) return 'Medical SBC';
    if (value.includes('summary') || value.includes('plan')) return 'Plan Summary';
    if (value.includes('census')) return 'Employee Census';
    if (value.includes('invoice')) return 'Invoice';
    if (value.includes('renewal')) return 'Renewal Document';
    if (value.includes('carrier')) return 'Carrier Document';
    if (value.includes('rate')) return 'Rates Document';
    if (value.includes('claim')) return 'Claims Report';
    if (value.includes('contract')) return 'Contract';
    return 'Other';
}

function validateFile(file: File): Pick<QueueItem, 'status' | 'error'> {
    if (file.size > MAX_FILE_SIZE) return { status: 'Too Large', error: 'File exceeds the 25 MB limit.' };
    if (!ALLOWED_MIME_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.test(file.name)) {
        return { status: 'Unsupported', error: 'Upload a PDF, Word, Excel, CSV, TXT, JPG, or PNG file.' };
    }
    return { status: 'Ready' };
}

function getStatusClass(status: UploadStatus) {
    if (status === 'Uploaded') return 'text-success-500';
    if (status === 'Uploading') return 'text-info-500';
    if (status === 'Failed' || status === 'Unsupported' || status === 'Too Large') return 'text-error-500';
    return 'text-neutral-400';
}

export default function DocumentUpload({ onUploadComplete, buttonLabel = 'Upload', buttonClassName }: DocumentUploadProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const summary = useMemo(() => {
        const uploaded = queue.filter((item) => item.status === 'Uploaded').length;
        const failed = queue.filter((item) => item.status === 'Failed').length;
        const invalid = queue.filter((item) => item.status === 'Unsupported' || item.status === 'Too Large').length;
        return { uploaded, failed, invalid };
    }, [queue]);

    const canUpload = queue.some((item) => item.status === 'Ready' && item.title.trim()) && !isUploading;

    const resetFileInput = () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const addFiles = (files: FileList | File[]) => {
        const items = Array.from(files).map((file) => {
            const validation = validateFile(file);
            return {
                id: getItemId(),
                file,
                title: getFileTitle(file.name),
                documentType: inferDocumentType(file.name),
                ...validation,
            };
        });

        setQueue((current) => [...current, ...items]);
        setIsComplete(false);
        resetFileInput();
    };

    const updateItem = (id: string, updates: Partial<QueueItem>) => {
        setQueue((current) => current.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    };

    const removeItem = (id: string) => {
        setQueue((current) => current.filter((item) => item.id !== id));
    };

    const resetAndClose = () => {
        setQueue([]);
        setIsUploading(false);
        setIsComplete(false);
        setDragActive(false);
        setShowDiscardConfirm(false);
        resetFileInput();
        setIsModalOpen(false);
    };

    const handleCloseRequest = () => {
        if (!isComplete && queue.length > 0) {
            setShowDiscardConfirm(true);
            return;
        }
        resetAndClose();
    };

    const handleDone = () => {
        const shouldRefresh = summary.uploaded > 0;
        resetAndClose();
        if (shouldRefresh) {
            router.refresh();
            onUploadComplete?.();
        }
    };

    const handleAddMoreAfterComplete = () => {
        setQueue([]);
        setIsComplete(false);
        setShowDiscardConfirm(false);
        window.setTimeout(() => fileInputRef.current?.click(), 0);
    };

    const handleUpload = async () => {
        const validItems = queue.filter((item) => item.status === 'Ready' && item.title.trim());
        if (validItems.length === 0) return;

        setIsUploading(true);

        for (const item of validItems) {
            updateItem(item.id, { status: 'Uploading', error: undefined });

            try {
                const formData = new FormData();
                formData.append('file', item.file);
                formData.append('name', item.file.name);
                formData.append('documentType', item.documentType);
                formData.append('documentTitle', item.title.trim() || getFileTitle(item.file.name));

                const response = await fetch('/api/documents/upload', {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json().catch(() => ({}));

                if (!response.ok) throw new Error(data.error || 'Upload failed.');
                updateItem(item.id, { status: 'Uploaded' });
            } catch (error) {
                updateItem(item.id, {
                    status: 'Failed',
                    error: error instanceof Error ? error.message : 'Upload failed. Please try again.',
                });
            }
        }

        setIsUploading(false);
        setIsComplete(true);
    };

    const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(event.type === 'dragenter' || event.type === 'dragover');
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(false);
        if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className={buttonClassName || DEFAULT_BUTTON_CLASS}
            >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {buttonLabel}
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative flex max-h-[90vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-modal animate-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between gap-6 border-b border-neutral-100 px-6 py-5 sm:px-8">
                            <div>
                                <h2 className="text-[24px] font-bold tracking-tight text-neutral-900">Add Documents</h2>
                                <p className="mt-2 max-w-[640px] text-[15px] leading-6 text-neutral-500">
                                    Upload benefit guides, census files, plan summaries, invoices, SBCs, or other supporting documents.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseRequest}
                                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                                aria-label="Close add documents modal"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(event) => event.target.files && addFiles(event.target.files)}
                            accept={ACCEPTED_EXTENSIONS}
                        />

                        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                            {!isComplete ? (
                                <div className="space-y-7">
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => fileInputRef.current?.click()}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click();
                                        }}
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}
                                        className={`flex min-h-[224px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                                            dragActive ? 'border-primary-500 bg-primary-50/40' : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/40'
                                        }`}
                                    >
                                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-50 text-neutral-400">
                                            <Upload className="h-7 w-7" />
                                        </div>
                                        <p className="text-[18px] font-bold text-neutral-900">Drag and drop files here</p>
                                        <p className="mt-2 text-[15px] text-neutral-500">or click to browse from your computer</p>
                                    </div>

                                    {queue.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <h3 className="text-[13px] font-bold uppercase tracking-wider text-neutral-400">
                                                    Selected Documents ({queue.length})
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => setQueue([])}
                                                    disabled={isUploading}
                                                    className="text-[12px] font-bold uppercase tracking-wider text-neutral-400 transition-colors hover:text-error-500 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Clear All
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {queue.map((item) => (
                                                    <div key={item.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card">
                                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-50 text-neutral-400">
                                                                <FileIcon className="h-6 w-6" />
                                                            </div>

                                                            <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_240px]">
                                                                <div>
                                                                    <label className="mb-2 block text-[12px] font-bold uppercase tracking-wider text-neutral-400">
                                                                        Document Title
                                                                    </label>
                                                                    <input
                                                                        value={item.title}
                                                                        onChange={(event) => updateItem(item.id, { title: event.target.value })}
                                                                        disabled={isUploading || item.status === 'Uploaded'}
                                                                        placeholder="Enter document title"
                                                                        className="h-11 w-full rounded-md border border-neutral-200 bg-white px-4 text-[15px] text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-50 disabled:text-neutral-500"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="mb-2 block text-[12px] font-bold uppercase tracking-wider text-neutral-400">
                                                                        Document Type
                                                                    </label>
                                                                    <div className="relative">
                                                                        <select
                                                                            value={item.documentType}
                                                                            onChange={(event) => updateItem(item.id, { documentType: event.target.value })}
                                                                            disabled={isUploading || item.status === 'Uploaded'}
                                                                            className="h-11 w-full appearance-none rounded-md border border-neutral-200 bg-white px-4 pr-10 text-[15px] text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-50 disabled:text-neutral-500"
                                                                        >
                                                                            {DOCUMENT_TYPES.map((type) => (
                                                                                <option key={type} value={type}>
                                                                                    {type}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {item.status !== 'Uploaded' && !isUploading && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeItem(item.id)}
                                                                    className="self-start rounded-full p-2 text-neutral-300 transition-colors hover:bg-error-bg hover:text-error-500 sm:self-center"
                                                                    aria-label={`Remove ${item.file.name}`}
                                                                >
                                                                    <Trash2 className="h-5 w-5" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="mt-4 flex flex-wrap items-center gap-3 pl-0 text-[12px] font-medium text-neutral-400 sm:pl-16">
                                                            <span className="max-w-[260px] truncate">{item.file.name}</span>
                                                            <span>•</span>
                                                            <span>{formatFileSize(item.file.size)}</span>
                                                            <span>•</span>
                                                            <span className={`flex items-center gap-1 font-bold uppercase tracking-wider ${getStatusClass(item.status)}`}>
                                                                {item.status === 'Uploading' && <Loader2 className="h-3 w-3 animate-spin" />}
                                                                {item.status === 'Uploaded' && <CheckCircle2 className="h-3 w-3" />}
                                                                {(item.status === 'Failed' || item.status === 'Unsupported' || item.status === 'Too Large') && <AlertCircle className="h-3 w-3" />}
                                                                {item.status}
                                                            </span>
                                                        </div>

                                                        {item.error && (
                                                            <p className="mt-2 flex items-center gap-1 pl-0 text-[12px] font-medium text-error-500 sm:pl-16">
                                                                <AlertCircle className="h-3.5 w-3.5" />
                                                                {item.error}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-12 text-center">
                                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success-bg text-success-500">
                                        <CheckCircle2 className="h-11 w-11" />
                                    </div>
                                    <h3 className="text-[26px] font-bold tracking-tight text-neutral-900">
                                        {summary.failed > 0 || summary.invalid > 0 ? 'Upload complete with issues' : 'Documents uploaded'}
                                    </h3>
                                    <p className="mt-3 max-w-[460px] text-[15px] leading-6 text-neutral-500">
                                        {summary.uploaded} document{summary.uploaded === 1 ? '' : 's'} uploaded successfully.
                                        {summary.failed > 0 && ` ${summary.failed} failed.`}
                                        {summary.invalid > 0 && ` ${summary.invalid} invalid file${summary.invalid === 1 ? '' : 's'} were not uploaded.`}
                                    </p>
                                    <p className="mt-2 text-[13px] text-neutral-400">
                                        Click Done to refresh your document list, or add more documents before leaving this workflow.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 border-t border-neutral-100 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                            <div>
                                {(!isComplete && queue.length > 0 && !isUploading) && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex h-10 items-center gap-2 px-2 text-[13px] font-bold uppercase tracking-wider text-neutral-600 transition-colors hover:text-neutral-900"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add More Files
                                    </button>
                                )}
                                {isComplete && (
                                    <button
                                        type="button"
                                        onClick={handleAddMoreAfterComplete}
                                        className="inline-flex h-10 items-center gap-2 rounded-md border border-neutral-200 px-4 text-[13px] font-bold uppercase tracking-wider text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add More Documents
                                    </button>
                                )}
                            </div>

                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                                {!isComplete ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleCloseRequest}
                                            disabled={isUploading}
                                            className="h-11 rounded-md px-7 text-[13px] font-bold uppercase tracking-wider text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleUpload}
                                            disabled={!canUpload}
                                            className="inline-flex h-11 min-w-[220px] items-center justify-center gap-2 rounded-md bg-[#97C25E] px-8 text-[13px] font-bold uppercase tracking-wider text-white shadow-card transition-colors hover:bg-[#8bb356] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#97C25E]"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                'Upload Documents'
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleDone}
                                        className="h-11 min-w-[160px] rounded-md bg-[#97C25E] px-10 text-[13px] font-bold uppercase tracking-wider text-white shadow-card transition-colors hover:bg-[#8bb356]"
                                    >
                                        Done
                                    </button>
                                )}
                            </div>
                        </div>

                        {showDiscardConfirm && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 p-6 backdrop-blur-sm">
                                <div className="w-full max-w-[400px] rounded-2xl border border-neutral-200 bg-white p-7 text-center shadow-modal">
                                    <h4 className="text-[22px] font-bold tracking-tight text-neutral-900">Discard selected documents?</h4>
                                    <p className="mt-3 text-[15px] leading-6 text-neutral-500">
                                        You have unsaved documents in your queue. Are you sure you want to exit?
                                    </p>
                                    <div className="mt-7 flex flex-col gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowDiscardConfirm(false)}
                                            className="h-12 rounded-md bg-[#97C25E] text-[13px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#8bb356]"
                                        >
                                            Keep Editing
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetAndClose}
                                            className="h-12 rounded-md text-[13px] font-bold uppercase tracking-wider text-neutral-600 transition-colors hover:bg-neutral-50"
                                        >
                                            Discard
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
