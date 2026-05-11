"use client";


import React, { useState } from 'react';
import { CATALOG_CATEGORIES, CATALOG_SOLUTIONS } from '../constants';
import { Solution } from '../types';

interface Props {
  onSelectSolution: (solution: Solution) => void;
}

const SolutionsCatalog: React.FC<Props> = ({ onSelectSolution }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Solutions');

  const filteredSolutions = CATALOG_SOLUTIONS.filter(solution => {
    const matchesSearch = solution.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All Solutions' || 
                           solution.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
                           (activeCategory === 'HCM/Payroll' && solution.category.includes('HR/Payroll'));
    return matchesSearch && matchesCategory;
  });

  const getTagColor = (color: string) => {
    switch (color) {
      case 'amber': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'pink': return 'bg-pink-50 text-pink-700 border-pink-100';
      case 'green': return 'bg-green-50 text-green-700 border-green-100';
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'cyan': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      default: return 'bg-neutral-50 text-neutral-600 border-neutral-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Page Header */}
      <div>
        <h1 className="text-neutral-900 tracking-tight mb-2">Solutions Catalog</h1>
      </div>

      {/* Modern Search Bar */}
      <div className="relative group max-w-4xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="Type here to search" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-neutral-200 rounded-sm pl-11 pr-4 py-2.5 text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-300 transition-all shadow-sm"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Sidebar: Filter Categories */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="sticky top-28">
            <h2 className="text-[13px] font-medium text-neutral-400 mb-4">Filter by Category</h2>
            <nav className="flex flex-wrap lg:flex-col gap-0.5">
              {CATALOG_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-2 rounded-sm text-[13px] font-medium transition-all text-left truncate ${
                    activeCategory === cat 
                      ? 'bg-neutral-100 text-neutral-900' 
                      : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Right Main Content: Solution Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSolutions.map((solution) => (
              <div 
                key={solution.id} 
                onClick={() => onSelectSolution(solution)}
                className="bg-white border border-neutral-200 rounded-md p-5 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all group cursor-pointer flex flex-col justify-center min-h-[100px]"
              >
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[17px] font-bold text-neutral-900 tracking-tight group-hover:text-primary-600 transition-colors truncate">
                    {solution.name}
                  </h3>
                  <div className="flex">
                    <span className={`px-2 py-0.5 rounded-sm text-[11px] font-medium border ${getTagColor(solution.color)}`}>
                      {solution.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filteredSolutions.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-neutral-50/50 rounded-md border border-dashed border-neutral-200">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <p className="text-neutral-900 font-bold text-lg">No solutions found</p>
                <p className="text-neutral-500 text-sm mt-1">Try adjusting your search or category filter.</p>
                <button 
                  onClick={() => {setSearchQuery(''); setActiveCategory('All Solutions');}}
                  className="mt-6 text-primary-600 font-bold text-sm hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {filteredSolutions.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button className="bg-white border border-neutral-900 text-neutral-900 px-8 py-2.5 rounded-md font-bold text-[15px] hover:bg-neutral-50 transition-all shadow-sm active:scale-95">
                See more
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionsCatalog;
