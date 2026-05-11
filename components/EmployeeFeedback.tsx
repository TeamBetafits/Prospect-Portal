"use client";


import React, { useState } from 'react';
import { FeedbackStats, FeedbackResponse } from '../types';
import EmptyState from './EmptyState';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Copy, 
  ExternalLink, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface Props {
  stats: FeedbackStats | null;
  responses: FeedbackResponse[];
}

const EmployeeFeedback: React.FC<Props> = ({ stats, responses }) => {
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredComment, setHoveredComment] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('All Years');
  const itemsPerPage = 10;
  
  const surveyUrl = "https://betafits.fillout.com/t/eQ7FVU76PDus";

  // Get unique years for the filter
  const uniqueYears = Array.from(new Set(responses.map(r => (r.year || new Date(r.submittedAt).getFullYear() || 2024).toString()))) as string[];
  const years = ['All Years', ...uniqueYears.sort((a, b) => b.localeCompare(a))];

  // Filtering responses
  const filteredResponses = responses.filter(r => selectedYear === 'All Years' || (r.year || new Date(r.submittedAt).getFullYear() || 2024).toString() === selectedYear);

  if (!responses || responses.length === 0 || !stats) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 pb-20"
      >
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">Employee Feedback</h1>
          <p className="text-neutral-500 font-medium max-w-2xl leading-relaxed">
            Review employee sentiment and share your company’s survey link to collect feedback on current benefits.
          </p>
        </div>
        <EmptyState />
      </motion.div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentResponses = filteredResponses.slice(startIndex, startIndex + itemsPerPage);

  const renderFieldTitle = (title: string) => (
    <div className="text-[13px] font-medium text-neutral-500 mb-1">{title}</div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-20"
    >
      {/* Section 1: Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">Employee Feedback</h1>
        <p className="text-neutral-500 font-medium max-w-2xl leading-relaxed">
          Review employee sentiment and share your company’s survey link to collect feedback on current benefits.
        </p>
      </div>

      {/* Section 2 & 3: Feedback Collection & Score Summary Side-by-Side */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Feedback Collection Section */}
        <div className="lg:w-1/3">
          <section className="bg-white border border-neutral-200 rounded-md p-8 shadow-sm flex flex-col h-full">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-neutral-900">Feedback Collection</h2>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-primary-50 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                  <span className="text-[9px] font-bold text-primary-600 uppercase tracking-wider">Active</span>
                </div>
              </div>
              <p className="text-[13px] text-neutral-500 font-medium leading-relaxed">
                Share this unique link with employees to gather feedback on benefits.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  readOnly 
                  value={surveyUrl}
                  className="w-full bg-white border border-neutral-200 rounded-sm pl-3 pr-10 py-2.5 text-[13px] font-medium text-neutral-600 focus:outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-primary-600 transition-colors"
                  title="Copy Link"
                >
                  {copied ? <CheckCircle2 size={16} className="text-primary-500" /> : <Copy size={16} />}
                </button>
              </div>
              <a 
                href={surveyUrl} 
                target="_blank" 
                rel="noreferrer"
                className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-sm font-bold text-[13px] text-neutral-700 hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
              >
                Open Form
                <ExternalLink size={14} />
              </a>
            </div>
          </section>
        </div>

        {/* Score Summary Section */}
        <div className="lg:w-2/3">
          <section className="bg-white border border-neutral-200 rounded-md p-8 shadow-sm h-full">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Score Summary</h2>
                <p className="text-sm text-neutral-500 font-medium">Employee ratings for current benefit experience.</p>
              </div>
              <select 
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-xs font-bold text-neutral-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-12">
              <div>
                {renderFieldTitle('Overall benefits package')}
                <div className="text-2xl font-bold text-neutral-900">{stats.overall}</div>
                <div className="mt-1 text-[11px] font-medium text-neutral-400">{filteredResponses.length} Responses</div>
              </div>
              <div>
                {renderFieldTitle('Medical plan option')}
                <div className="text-2xl font-bold text-neutral-900">{stats.medicalOptions}</div>
              </div>
              <div>
                {renderFieldTitle('Medical network')}
                <div className="text-2xl font-bold text-neutral-900">{stats.medicalNetwork}</div>
              </div>
              <div>
                {renderFieldTitle('Employee costs')}
                <div className="text-2xl font-bold text-neutral-900">{stats.employeeCost}</div>
              </div>
              <div>
                {renderFieldTitle('Other benefits [non-medical]')}
                <div className="text-2xl font-bold text-neutral-900">{stats.nonMedical}</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Section 4: Employee Feedback Summary */}
      <section>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Employee Feedback Summary</h2>
            <p className="text-sm text-neutral-500 font-medium">Survey responses submitted by employees about their current benefit plans.</p>
          </div>
          <button className="text-[13px] font-bold text-primary-600 flex items-center gap-2 hover:bg-primary-50 px-3 py-2 rounded-sm transition-colors border border-primary-100">
            <Download size={14} />
            Export to CSV
          </button>
        </div>

        <div className="bg-white border border-neutral-200 rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-100">
                  <th className="px-6 py-4 text-left text-[13px] font-medium text-neutral-500">Submitted</th>
                  <th className="px-6 py-4 text-left text-[13px] font-medium text-neutral-500">Tier</th>
                  <th className="px-4 py-4 text-center text-[13px] font-medium text-neutral-500">Overall benefits package</th>
                  <th className="px-4 py-4 text-center text-[13px] font-medium text-neutral-500">Medical plan option</th>
                  <th className="px-4 py-4 text-center text-[13px] font-medium text-neutral-500">Medical network</th>
                  <th className="px-4 py-4 text-center text-[13px] font-medium text-neutral-500">Employee costs</th>
                  <th className="px-4 py-4 text-center text-[13px] font-medium text-neutral-500">Other benefits [non-medical]</th>
                  <th className="px-6 py-4 text-left text-[13px] font-medium text-neutral-500">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {currentResponses.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-neutral-600 whitespace-nowrap">
                      {row.submittedAt.split(',')[0]}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-neutral-900">{row.tier}</span>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-neutral-700">{row.overallRating}</td>
                    <td className="px-4 py-4 text-center font-bold text-neutral-700">{row.medicalOptions}</td>
                    <td className="px-4 py-4 text-center font-bold text-neutral-700">{row.medicalNetwork}</td>
                    <td className="px-4 py-4 text-center font-bold text-neutral-700">{row.medicalCost}</td>
                    <td className="px-4 py-4 text-center font-bold text-neutral-700">{row.nonMedical}</td>
                    <td className="px-6 py-4 min-w-[200px] relative">
                      {row.comments ? (
                        <div 
                          className="cursor-help"
                          onMouseEnter={() => setHoveredComment(row.id)}
                          onMouseLeave={() => setHoveredComment(null)}
                        >
                          <p className="text-xs text-neutral-500 font-medium line-clamp-2 leading-relaxed">
                            {row.comments}
                          </p>
                          <AnimatePresence>
                            {hoveredComment === row.id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                className="absolute z-50 bottom-full left-0 mb-2 w-72 p-4 bg-neutral-900 text-white text-xs font-medium rounded-sm shadow-2xl pointer-events-none"
                              >
                                {row.comments}
                                <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-neutral-900"></div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <span className="text-neutral-200">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-neutral-50/30 border-t border-neutral-100 flex items-center justify-between">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredResponses.length)} of {filteredResponses.length} responses
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-sm border border-neutral-200 text-neutral-400 hover:bg-white hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-sm text-xs font-bold transition-all ${
                      currentPage === page 
                        ? 'bg-primary-500 text-white shadow-sm' 
                        : 'text-neutral-400 hover:bg-white hover:text-neutral-900'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-sm border border-neutral-200 text-neutral-400 hover:bg-white hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default EmployeeFeedback;
