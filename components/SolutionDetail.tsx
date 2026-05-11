"use client";


import React from 'react';
import { motion } from 'motion/react';
import { Solution } from '../types';

interface Props {
  solution: Solution;
  onBack: () => void;
}

const SolutionDetail: React.FC<Props> = ({ solution, onBack }) => {
  const getLogoPlaceholder = (name: string, color: string) => {
    const colorMap: Record<string, string> = {
      'brand': 'primary',
      'blue': 'info',
      'green': 'success',
      'amber': 'warning',
      'pink': 'error',
      'purple': 'indigo',
      'gray': 'neutral'
    };
    const tokenColor = colorMap[color] || 'neutral';
    
    return (
      <div className={`w-16 h-16 rounded-md flex items-center justify-center text-2xl font-black bg-${tokenColor}-500 text-white shadow-sm flex-shrink-0`}>
        {name[0]}
      </div>
    );
  };

  const getTagColor = (color: string) => {
    switch (color) {
      case 'amber': return 'bg-warning-50 text-warning-700 border-warning-100';
      case 'purple': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'pink': return 'bg-error-50 text-error-700 border-error-100';
      case 'green': return 'bg-success-50 text-success-700 border-success-100';
      case 'blue': return 'bg-info-50 text-info-700 border-info-100';
      case 'gray': return 'bg-neutral-50 text-neutral-700 border-neutral-100';
      default: return 'bg-neutral-50 text-neutral-600 border-neutral-100';
    }
  };

  const aboutContent = solution.linkedinDescription || solution.packageContent || solution.description;
  const whatIsInvolvedContent = solution.packageContent;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-10 pb-20"
    >
      {/* Navigation */}
      <nav>
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-[13px] font-bold text-neutral-400 hover:text-primary-500 transition-colors"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Catalog
        </button>
      </nav>

      {/* Header Area */}
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex gap-6 items-start">
          {getLogoPlaceholder(solution.name, solution.color)}
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-neutral-900 tracking-tight leading-none">
              {solution.name}
            </h1>
            {solution.industry && (
              <p className="text-lg font-medium text-neutral-500">
                {solution.industry}
              </p>
            )}
            <div className="pt-1">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTagColor(solution.color)}`}>
                {solution.category}
              </span>
            </div>
          </div>
        </div>

        {solution.websiteUrl && (
          <a 
            href={solution.websiteUrl} 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-6 py-2.5 rounded-sm font-bold text-[13px] text-neutral-900 hover:bg-neutral-50 transition-all shadow-sm"
          >
            Visit Website
            <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </header>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-12">
          {/* About Section */}
          <section className="space-y-4">
            <h2 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">About the Company</h2>
            <div className="text-[15px] leading-relaxed text-neutral-600 font-medium">
              {aboutContent}
            </div>
          </section>

          {/* What's Included */}
          {solution.features && solution.features.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">What's Included</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                {solution.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                    <span className="text-[14px] font-bold text-neutral-900 leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* What's Involved */}
          {whatIsInvolvedContent && (
            <section className="space-y-4">
              <h2 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">What's Involved</h2>
              <div className="text-[15px] leading-relaxed text-neutral-600 font-medium">
                {whatIsInvolvedContent}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Metadata */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-neutral-50 rounded-md p-6 border border-neutral-100 space-y-6">
            <div className="space-y-1">
              <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Category</h3>
              <p className="text-[14px] font-bold text-neutral-900">{solution.category}</p>
            </div>

            {solution.subCategory && (
              <div className="space-y-1">
                <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Sub-Category</h3>
                <p className="text-[14px] font-bold text-neutral-900">{solution.subCategory}</p>
              </div>
            )}

            {solution.bestFitFor && (
              <div className="space-y-1">
                <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Best Fit For</h3>
                <p className="text-[14px] font-bold text-neutral-600 leading-relaxed">{solution.bestFitFor}</p>
              </div>
            )}

            {solution.pairsWellWith && (
              <div className="space-y-1">
                <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Pairs Well With</h3>
                <p className="text-[14px] font-bold text-neutral-600 leading-relaxed">{solution.pairsWellWith}</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

export default SolutionDetail;
