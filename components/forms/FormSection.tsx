'use client';

import React, { useState } from 'react';
import { FormSectionData, FormValues } from '@/types/form';

interface Props {
    section: FormSectionData;
    values: FormValues;
    errors: Record<string, string>;
    onChange: (id: string, value: any) => void;
    readonlyFields?: Record<string, boolean>;
}

const FormSection: React.FC<Props> = ({ section, values, errors, onChange, readonlyFields }) => {
    const [isCollapsed, setIsCollapsed] = useState(section.defaultCollapsed ?? false);

    return (
        <div className="mb-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                    {section.description && (
                        <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                    )}
                </div>
                {section.isCollapsible && (
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                        aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
                    >
                        <svg
                            className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                )}
            </div>

            {!isCollapsed && (
                <div className="space-y-5">
                {section.questions.map((question) => (
                    <div key={question.id} className="flex flex-col">
                        <label htmlFor={question.id} className="text-[13px] font-semibold text-gray-700 mb-1.5 ml-0.5">
                            {question.label} {question.required && <span className="text-red-500">*</span>}
                        </label>

                        {question.type === 'text' || question.type === 'email' || question.type === 'date' ? (
                            <input
                                type={question.type}
                                id={question.id}
                                value={values[question.id] || ''}
                                onChange={(e) => onChange(question.id, e.target.value)}
                                placeholder={question.placeholder}
                                disabled={readonlyFields?.[question.id] === true}
                                className={`px-3 py-2.5 rounded-md border text-[14px] outline-none transition-all placeholder:text-gray-400 ${errors[question.id]
                                        ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-400 focus:ring-2 focus:ring-brand-100'
                                        : readonlyFields?.[question.id]
                                        ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                                        : 'border-gray-200 bg-white text-gray-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100'
                                    }`}
                            />
                        ) : question.type === 'number' ? (
                            // Check if this should be a range slider or rating buttons
                            question.label?.toLowerCase().includes('package') || question.label?.toLowerCase().includes('options') || question.label?.toLowerCase().includes('satisfaction') ? (
                                // Render as range slider for satisfaction ratings
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                        <span>Completely Unsatisfied</span>
                                        <span>Completely Satisfied</span>
                                    </div>
                                    <input
                                        type="range"
                                        id={question.id}
                                        min="1"
                                        max="10"
                                        step="1"
                                        value={values[question.id] || '1'}
                                        onChange={(e) => onChange(question.id, e.target.value)}
                                        disabled={readonlyFields?.[question.id] === true}
                                        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none accent-brand-500 ${readonlyFields?.[question.id] ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                    />
                                    <div className="flex justify-center">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {values[question.id] || '1'} / 10
                                        </span>
                                    </div>
                                </div>
                            ) : question.label?.toLowerCase().includes('rate') && question.helperText ? (
                                // Render as rating buttons (1-10) for broker evaluation questions
                                <div className="space-y-2">
                                    {question.helperText && (
                                        <p className="text-xs text-gray-500 mb-3">{question.helperText}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                                            <button
                                                key={rating}
                                                type="button"
                                                onClick={() => !readonlyFields?.[question.id] && onChange(question.id, String(rating))}
                                                disabled={readonlyFields?.[question.id] === true}
                                                className={`w-12 h-12 rounded-lg font-semibold text-sm transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                                                    values[question.id] === String(rating)
                                                        ? 'bg-brand-500 text-white shadow-md scale-105'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                                }`}
                                            >
                                                {rating}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <input
                                    type="number"
                                    id={question.id}
                                    value={values[question.id] || ''}
                                    onChange={(e) => {
                                        let value: any = e.target.value;
                                        const numValue = parseFloat(value);
                                        if (!isNaN(numValue) && numValue < 0) {
                                            value = '';
                                        }
                                        onChange(question.id, value);
                                    }}
                                    placeholder={question.placeholder}
                                    min="0"
                                    disabled={readonlyFields?.[question.id] === true}
                                    className={`px-3 py-2.5 rounded-md border text-[14px] outline-none transition-all placeholder:text-gray-400 ${errors[question.id]
                                            ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-400 focus:ring-2 focus:ring-brand-100'
                                            : readonlyFields?.[question.id]
                                            ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                                            : 'border-gray-200 bg-white text-gray-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100'
                                        }`}
                                />
                            )
                        ) : question.type === 'textarea' ? (
                            <textarea
                                id={question.id}
                                value={values[question.id] || ''}
                                onChange={(e) => onChange(question.id, e.target.value)}
                                placeholder={question.placeholder}
                                rows={4}
                                disabled={readonlyFields?.[question.id] === true}
                                className={`px-3 py-2.5 rounded-md border text-[14px] outline-none transition-all placeholder:text-gray-400 ${errors[question.id]
                                        ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-400 focus:ring-2 focus:ring-brand-100'
                                        : readonlyFields?.[question.id]
                                        ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed resize-none'
                                        : 'border-gray-200 bg-white text-gray-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100'
                                    }`}
                            />
                        ) : question.type === 'file' ? (
                            <div className="space-y-2">
                                <input
                                    type="file"
                                    id={question.id}
                                    accept={question.accept}
                                    multiple={question.multiple}
                                    disabled={readonlyFields?.[question.id] === true}
                                    onChange={async (e) => {
                                        const files = e.target.files;
                                        if (files && files.length > 0) {
                                            // For single file, store the file object
                                            // For multiple files, store as array
                                            if (question.multiple) {
                                                const fileArray = Array.from(files);
                                                onChange(question.id, fileArray);
                                            } else {
                                                onChange(question.id, files[0]);
                                            }
                                        }
                                    }}
                                    className={`w-full px-3 py-2.5 rounded-md border text-[14px] outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-500 file:text-white hover:file:bg-brand-600 file:cursor-pointer ${errors[question.id]
                                            ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-400'
                                            : readonlyFields?.[question.id]
                                            ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                                            : 'border-gray-200 bg-white text-gray-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100'
                                        }`}
                                />
                                {values[question.id] && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600">
                                        {question.multiple && Array.isArray(values[question.id]) ? (
                                            <div>
                                                <span className="font-semibold">{values[question.id].length} file(s) selected:</span>
                                                <ul className="mt-1 ml-4 list-disc">
                                                    {Array.from(values[question.id] as File[]).map((file: File, idx: number) => (
                                                        <li key={idx}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : values[question.id] instanceof File ? (
                                            <span>
                                                <span className="font-semibold">Selected:</span> {(values[question.id] as File).name} 
                                                ({(values[question.id] as File).size / 1024} KB)
                                            </span>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        ) : question.type === 'select' ? (
                            <div className="relative">
                                <select
                                    id={question.id}
                                    value={values[question.id] || ''}
                                    onChange={(e) => onChange(question.id, e.target.value)}
                                    disabled={readonlyFields?.[question.id] === true}
                                    className={`w-full px-3 py-2.5 rounded-md border text-[14px] outline-none transition-all appearance-none ${errors[question.id]
                                            ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-400 focus:ring-2 focus:ring-brand-100 cursor-pointer'
                                            : readonlyFields?.[question.id]
                                            ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                                            : 'border-gray-200 bg-white text-gray-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 cursor-pointer'
                                        }`}
                                >
                                    <option value="" disabled>Select an option</option>
                                    {question.options?.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        ) : question.type === 'radio' ? (
                            // Check if this is a rating scale (1-10 radio buttons) - render as rating buttons
                            question.options?.length === 10 && question.options.every((opt, idx) => opt.value === String(idx + 1) && opt.label === String(idx + 1)) ? (
                                <div className="space-y-2">
                                    {question.helperText && (
                                        <p className="text-xs text-gray-500 mb-3">{question.helperText}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {question.options.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => !readonlyFields?.[question.id] && onChange(question.id, opt.value)}
                                                disabled={readonlyFields?.[question.id] === true}
                                                className={`w-12 h-12 rounded-lg font-semibold text-sm transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                                                    values[question.id] === opt.value
                                                        ? 'bg-brand-500 text-white shadow-md scale-105'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {question.options?.map((opt) => (
                                        <label key={opt.value} className={`flex items-center gap-3 group ${readonlyFields?.[question.id] ? 'pointer-events-none opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                                            <div className="relative flex items-center justify-center w-5 h-5">
                                                <input
                                                    type="radio"
                                                    name={question.id}
                                                    value={opt.value}
                                                    checked={values[question.id] === opt.value}
                                                    onChange={(e) => onChange(question.id, e.target.value)}
                                                    disabled={readonlyFields?.[question.id] === true}
                                                    className="peer appearance-none w-5 h-5 border border-gray-300 rounded-full checked:border-brand-500 checked:bg-brand-500 transition-all"
                                                />
                                                <div className="absolute w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                            </div>
                                            <span className="text-[14px] text-gray-700 group-hover:text-gray-900 transition-colors">
                                                {opt.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )
                        ) : question.type === 'checkbox' ? (
                            <div className="space-y-2">
                                {question.options?.map((opt) => {
                                    const checkboxValue = Array.isArray(values[question.id]) 
                                        ? values[question.id] 
                                        : [];
                                    const isChecked = checkboxValue.includes(opt.value);
                                    
                                    return (
                                        <label key={opt.value} className={`flex items-center gap-3 group ${readonlyFields?.[question.id] ? 'pointer-events-none opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                                            <div className="relative flex items-center justify-center w-5 h-5">
                                                <input
                                                    type="checkbox"
                                                    value={opt.value}
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const currentValues = Array.isArray(values[question.id]) 
                                                            ? values[question.id] 
                                                            : [];
                                                        if (e.target.checked) {
                                                            onChange(question.id, [...currentValues, opt.value]);
                                                        } else {
                                                            onChange(question.id, currentValues.filter((v: any) => v !== opt.value));
                                                        }
                                                    }}
                                                    disabled={readonlyFields?.[question.id] === true}
                                                    className="peer appearance-none w-5 h-5 border border-gray-300 rounded checked:border-brand-500 checked:bg-brand-500 transition-all"
                                                />
                                                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-[14px] text-gray-700 group-hover:text-gray-900 transition-colors">
                                                {opt.label}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : null}

                        {errors[question.id] && (
                            <span className="text-[12px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors[question.id]}
                            </span>
                        )}
                        {question.helperText && !errors[question.id] && (
                            <span className="text-[12px] text-gray-400 mt-1.5">{question.helperText}</span>
                        )}
                    </div>
                ))}
                </div>
            )}
        </div>
    );
};

export default FormSection;
