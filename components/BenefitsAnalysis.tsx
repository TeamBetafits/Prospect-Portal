'use client';

import React from 'react';
import { DemographicInsights, FinancialKPIs, BudgetBreakdown } from '@/types';

interface ReportType {
  type: string;
  documents: any[];
}

interface Props {
  demographics: DemographicInsights | null;
  kpis: FinancialKPIs | null;
  breakdown: BudgetBreakdown[];
  reportUrl?: string;
  availableReportTypes?: ReportType[];
}

const BenefitsAnalysis: React.FC<Props> = ({ demographics, kpis, breakdown, reportUrl, availableReportTypes = [] }) => {
  const [selectedReportType, setSelectedReportType] = React.useState<string>('');
  const [selectedReportUrl, setSelectedReportUrl] = React.useState<string | undefined>(reportUrl);
  
  // Initialize with first available type or default
  React.useEffect(() => {
    if (availableReportTypes.length > 0 && !selectedReportType) {
      // Prefer "Benefit Budget Report" or "Budget Report" if available, otherwise use first type
      const preferredType = availableReportTypes.find(r => 
        r.type.toLowerCase().includes('budget') || 
        r.type.toLowerCase().includes('benefit budget')
      );
      const initialType = preferredType?.type || availableReportTypes[0].type;
      setSelectedReportType(initialType);
      updateReportUrl(initialType);
    } else if (reportUrl && !selectedReportType) {
      // Use the provided reportUrl if no types available
      setSelectedReportUrl(reportUrl);
    }
  }, [availableReportTypes, reportUrl]);
  
  const updateReportUrl = (docType: string) => {
    const reportType = availableReportTypes.find(r => r.type === docType);
    if (reportType && reportType.documents.length > 0) {
      const doc = reportType.documents[0]; // Get most recent document
      const fileField = doc.fields['File'];
      const fileAttachment = Array.isArray(fileField) && fileField.length > 0 ? (fileField[0] as any) : null;
      
      if (fileAttachment?.url) {
        setSelectedReportUrl(fileAttachment.url);
      } else {
        const fileId = doc.fields['File ID'] || doc.fields['FileId'];
        const fileUrl = doc.fields['File URL'] || doc.fields['FileUrl'];
        
        if (fileId && typeof fileId === 'string') {
          const baseUrl = window.location.origin;
          setSelectedReportUrl(`${baseUrl}/api/files/${fileId}`);
        } else if (fileUrl && typeof fileUrl === 'string') {
          setSelectedReportUrl(fileUrl);
        } else {
          setSelectedReportUrl(undefined);
        }
      }
    } else {
      setSelectedReportUrl(undefined);
    }
  };
  
  const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setSelectedReportType(newType);
    updateReportUrl(newType);
  };
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Default values if not provided
  const defaultDemographics: DemographicInsights = {
    eligibleEmployees: 0,
    averageSalary: 0,
    averageAge: 0,
    malePercentage: 0,
    femalePercentage: 0,
  };

  const defaultKpis: FinancialKPIs = {
    totalMonthlyCost: 0,
    totalEmployerContribution: 0,
    totalEmployeeContribution: 0,
    erCostPerEligible: 0,
  };

  const displayDemographics = demographics || defaultDemographics;
  const displayKpis = kpis || defaultKpis;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Header & Report Asset */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">Benefits Analysis</h1>
          <p className="text-neutral-500 font-medium max-w-2xl leading-relaxed">
            A strategic overview of workforce demographics, financial benchmarks, and budget distribution across your benefit ecosystem.
          </p>
        </div>
        
        {/* Featured Report Card */}
        {availableReportTypes.length > 0 ? (
          <div className="flex-shrink-0 bg-white border border-neutral-200 rounded-md p-4 shadow-card hover:shadow-card transition-all flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 bg-primary-50 rounded-md flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-neutral-900 leading-tight mb-1">Benefit Budget Report</div>
              <select
                value={selectedReportType}
                onChange={handleReportTypeChange}
                className="text-[12px] text-neutral-600 font-medium bg-transparent border-none p-0 cursor-pointer focus:outline-none focus:ring-0 w-full"
              >
                {availableReportTypes.map((reportType) => (
                  <option key={reportType.type} value={reportType.type}>
                    {reportType.type}
                  </option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => {
                const urlToOpen = selectedReportUrl || reportUrl;
                if (urlToOpen) {
                  window.open(urlToOpen, '_blank', 'noopener,noreferrer');
                } else {
                  console.warn('[BenefitsAnalysis] No report URL available');
                  alert('Report not found. Please ensure the document is uploaded to Airtable in the "Intake - Document Upload" table.');
                }
              }}
              disabled={!selectedReportUrl && !reportUrl}
              className={`ml-4 px-5 py-2 rounded-md text-sm font-bold transition-colors shadow-card flex-shrink-0 ${
                selectedReportUrl || reportUrl
                  ? 'bg-primary-500 text-white hover:bg-primary-600 cursor-pointer'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              View Report
            </button>
          </div>
        ) : (
          <div className="flex-shrink-0 bg-white border border-neutral-200 rounded-md p-6 shadow-card w-full md:w-[320px]">
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="w-12 h-12 bg-neutral-50 rounded-md flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-neutral-500 font-medium text-sm">No results found, try adjusting your search and filters.</p>
            </div>
          </div>
        )}
      </div>

      {/* Financial KPIs - Large Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Monthly Cost', value: formatCurrency(displayKpis.totalMonthlyCost), color: 'gray' },
          { label: 'Total Employer Contribution', value: formatCurrency(displayKpis.totalEmployerContribution), color: 'brand' },
          { label: 'Total Employee Contribution', value: formatCurrency(displayKpis.totalEmployeeContribution), color: 'blue' },
          { label: 'ER Cost per Eligible Employee', value: formatCurrency(displayKpis.erCostPerEligible), color: 'amber', highlight: true },
        ].map((item, idx) => (
          <div key={idx} className={`bg-white border ${item.highlight ? 'border-amber-200 bg-amber-50/10' : 'border-neutral-200'} rounded-md p-6 shadow-card hover:shadow-card transition-shadow`}>
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">{item.label}</div>
            <div className={`text-2xl font-black ${item.color === 'brand' ? 'text-primary-600' : 'text-neutral-900'} tracking-tight`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Demographic Insights */}
      <div className="w-full">
        <div className="bg-white border border-neutral-200 rounded-md p-8 shadow-card flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neutral-50 rounded-full -mr-32 -mt-32 opacity-30"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="mb-10">
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Demographic Insights</h2>
              <p className="text-sm text-neutral-500 font-medium mt-1">Key company demographics shaping benefit needs.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
              <div className="bg-neutral-50/50 p-6 rounded-md border border-neutral-100 flex flex-col items-center text-center">
                 <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-primary-600 mb-3 shadow-card">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                 </div>
                 <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Eligible Employees</div>
                 <div className="text-2xl font-black text-neutral-900">{displayDemographics.eligibleEmployees}</div>
              </div>
              <div className="bg-neutral-50/50 p-6 rounded-md border border-neutral-100 flex flex-col items-center text-center">
                 <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-blue-600 mb-3 shadow-card">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Average Salary</div>
                 <div className="text-2xl font-black text-neutral-900">{formatCurrency(displayDemographics.averageSalary)}</div>
              </div>
              <div className="bg-neutral-50/50 p-6 rounded-md border border-neutral-100 flex flex-col items-center text-center">
                 <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-amber-600 mb-3 shadow-card">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Average Age</div>
                  <div className="text-2xl font-black text-neutral-900">{Number(displayDemographics.averageAge).toFixed(1)} <span className="text-sm font-medium text-neutral-400">YRS</span></div>
               </div>
            </div>

            {/* Gender Composition Viz */}
            <div className="mt-auto">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Gender Composition</div>
                  <div className="text-[16px] font-bold text-neutral-900">Workforce Split</div>
                </div>
                <div className="flex gap-4">
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md">Male {Number(displayDemographics.malePercentage).toFixed(1)}%</span>
                  <span className="text-sm font-bold text-pink-500 bg-pink-50 px-3 py-1 rounded-md">Female {Number(displayDemographics.femalePercentage).toFixed(1)}%</span>
                </div>
              </div>
              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${displayDemographics.malePercentage}%` }}></div>
                <div className="h-full bg-pink-400 transition-all duration-1000" style={{ width: `${displayDemographics.femalePercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefit Budget Breakdown - Data Grid */}
      <div className="bg-white border border-neutral-200 rounded-md shadow-card overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Benefit Budget Breakdown</h2>
          <p className="text-sm text-neutral-500 font-medium mt-1">Plan-by-plan cost distribution matrix.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-100">
            <thead>
              <tr className="bg-neutral-50/30">
                <th className="px-8 py-5 text-left text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Benefit</th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Carrier</th>
                <th className="px-6 py-5 text-center text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Participation</th>
                <th className="px-6 py-5 text-right text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Monthly Total</th>
                <th className="px-6 py-5 text-right text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Annual Total</th>
                <th className="px-6 py-5 text-right text-[11px] font-bold text-neutral-400 uppercase tracking-widest">ER Cost/Month</th>
                <th className="px-6 py-5 text-right text-[11px] font-bold text-neutral-400 uppercase tracking-widest">EE Cost/Month</th>
                <th className="px-8 py-5 text-right text-[11px] font-bold text-neutral-400 uppercase tracking-widest">ER Cost/Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {breakdown.length > 0 ? (
                breakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-primary-50/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${row.benefit === 'Medical' ? 'bg-primary-500' : row.benefit === 'Dental' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                        <div className="text-[16px] font-bold text-neutral-900">{row.benefit}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-[15px] font-medium text-neutral-600">{row.carrier}</td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col items-center">
                        <span className="text-[15px] font-bold text-neutral-900">{row.participation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right text-[16px] font-bold text-neutral-900">{formatCurrency(row.monthlyTotal)}</td>
                    <td className="px-6 py-6 text-right text-[16px] font-bold text-neutral-900">{formatCurrency(row.annualTotal)}</td>
                    <td className="px-6 py-6 text-right text-[15px] font-bold text-primary-600">{formatCurrency(row.erCostMonth)}</td>
                    <td className="px-6 py-6 text-right text-[15px] font-bold text-blue-600">{formatCurrency(row.eeCostMonth)}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="inline-block px-3 py-1 bg-neutral-50 border border-neutral-100 rounded-md text-[15px] font-bold text-neutral-900">
                        {formatCurrency(row.erCostEnrolled)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-8 py-12">
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-16 bg-neutral-50 rounded-md flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {breakdown.length > 0 && (
              <tfoot className="bg-neutral-50/50">
                <tr>
                  <td colSpan={3} className="px-8 py-5 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Totals</td>
                  <td className="px-6 py-5 text-right text-[17px] font-black text-neutral-900">{formatCurrency(breakdown.reduce((acc, r) => acc + r.monthlyTotal, 0))}</td>
                  <td className="px-6 py-5 text-right text-[17px] font-black text-neutral-900">{formatCurrency(breakdown.reduce((acc, r) => acc + r.annualTotal, 0))}</td>
                  <td className="px-6 py-5 text-right text-[17px] font-black text-primary-700">{formatCurrency(breakdown.reduce((acc, r) => acc + r.erCostMonth, 0))}</td>
                  <td className="px-6 py-5 text-right text-[17px] font-black text-blue-700">{formatCurrency(breakdown.reduce((acc, r) => acc + r.eeCostMonth, 0))}</td>
                  <td className="px-8 py-5"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default BenefitsAnalysis;
