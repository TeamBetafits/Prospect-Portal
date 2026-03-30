'use client';

import React, { useState } from 'react';

export interface NewUser {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
}

interface AddNewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (user: NewUser) => void;
}

export default function AddNewUserModal({ isOpen, onClose, onSubmit }: AddNewUserModalProps) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [title, setTitle] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    if (!isOpen) return null;

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!firstName.trim()) newErrors.firstName = 'Field is required';
        if (!lastName.trim()) newErrors.lastName = 'Field is required';
        if (!title.trim()) newErrors.title = 'Field is required';
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Valid email is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({ firstName, lastName, title, email });
            // Reset fields
            setFirstName('');
            setLastName('');
            setTitle('');
            setEmail('');
        }
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
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-[#4A5568] mb-1.5 flex gap-1">
                                First Name <span className="text-gray-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-md border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-800`}
                            />
                            {errors.firstName && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><span className="text-xs">!</span> {errors.firstName}</p>}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-[#4A5568] mb-1.5 flex gap-1">
                                Last Name <span className="text-gray-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-md border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-800`}
                            />
                            {errors.lastName && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><span className="text-xs">!</span> {errors.lastName}</p>}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-[#4A5568] mb-1.5 flex gap-1">
                                Title <span className="text-gray-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-md border ${errors.title ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-800`}
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><span className="text-xs">!</span> {errors.title}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-[#4A5568] mb-1.5 flex gap-1">
                                Email <span className="text-gray-400">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-800`}
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><span className="text-xs">!</span> {errors.email}</p>}
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
                    
                    <div className="mt-6 border-t border-gray-100 pt-4 flex justify-between items-center text-xs text-gray-400">
                        <span>Never share passwords in forms. <a href="#" className="underline">Report malicious form</a></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
