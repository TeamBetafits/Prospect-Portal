"use client";


import React, { useState } from 'react';
import { BenefitEligibilityData, ContributionStrategy, BenefitPlan } from '../types';
import EmptyState from './EmptyState';

interface Props {
  eligibility: BenefitEligibilityData | null;
  strategies: ContributionStrategy[];
  plans: BenefitPlan[];
}

const RatesModal: React.FC<{ plan: BenefitPlan; onClose: () => void }> = ({ plan, onClose }) => {
  const tiers = [
    { label: 'EE', premium: '$500', er: '$400', ee: '$100' },
    { label: 'ES', premium: '$900', er: '$700', ee: '$200' },
    { label: 'EC', premium: '$1,200', er: '$900', ee: '$300' },
    { label: 'EF', premium: '$1,500', er: '$1,100', ee: '$400' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-md shadow-modal w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-neutral-200 scale-in-center animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-10 pt-10 pb-4 relative">
          <button 
            onClick={onClose} 
            className="absolute top-8 right-8 p-1.5 hover:bg-neutral-100 rounded-md text-neutral-400 transition-all z-10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="mb-6">
            <h2 className="text-[26px] font-bold text-primary-500 tracking-tight leading-tight mb-2">{plan.name}</h2>
            <p className="text-[16px] font-bold text-neutral-900">{plan.carrier} Rates</p>
          </div>
        </div>

        {/* Modal Body - Rates Table */}
        <div className="px-10 pb-12 overflow-y-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="py-4 text-left text-[13px] font-medium text-neutral-500">Tier</th>
                <th className="py-4 text-right text-[13px] font-medium text-neutral-500">Premium</th>
                <th className="py-4 text-right text-[13px] font-medium text-neutral-500">Employer Cost</th>
                <th className="py-4 text-right text-[13px] font-medium text-neutral-500">Employee Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {tiers.map((tier, idx) => (
                <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-5 text-[14px] font-bold text-neutral-900">{tier.label}</td>
                  <td className="py-5 text-right text-[14px] font-bold text-neutral-900">{tier.premium}</td>
                  <td className="py-5 text-right text-[14px] font-bold text-neutral-900 text-success-600">{tier.er}</td>
                  <td className="py-5 text-right text-[14px] font-bold text-neutral-900 text-primary-600">{tier.ee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PlanDetailsModal: React.FC<{ plan: BenefitPlan; onClose: () => void }> = ({ plan, onClose }) => {
  const renderField = (label: string, value: string | number | undefined, isTag = false) => (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] font-medium text-neutral-500">{label}</span>
      {isTag && value ? (
        <span className="inline-flex w-fit px-2 py-0.5 rounded-sm text-[11px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
          {value}
        </span>
      ) : (
        <span className="text-[14px] font-bold text-neutral-900">{value || '–'}</span>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-md shadow-modal w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-neutral-200 scale-in-center animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-10 pt-10 pb-6 relative border-b border-neutral-100">
          <button 
            onClick={onClose} 
            className="absolute top-8 right-8 p-1.5 hover:bg-neutral-100 rounded-md text-neutral-400 transition-all z-10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="mb-2">
            <h2 className="text-[24px] font-bold text-primary-500 tracking-tight leading-tight">{plan.name}</h2>
            <p className="text-[14px] font-bold text-neutral-900">{plan.carrier}</p>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="px-10 py-8 overflow-y-auto space-y-10">
          
          {/* Section 1: Overview (Same as Card) */}
          <section>
            <h3 className="text-[13px] font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
              Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-y-6 gap-x-8">
              {plan.category === 'Medical' && (
                <>
                  {renderField("Carrier", plan.carrier)}
                  {renderField("Plan Score", plan.score)}
                  {renderField("Medical Plan Type", plan.type, true)}
                  {renderField("Deductible (Single)", plan.deductible)}
                  {renderField("OOPM (Single)", plan.oopm)}
                  {renderField("Coinsurance", plan.coinsurance)}
                  {renderField("Copay", plan.copay)}
                  {renderField("Rx (Combined)", plan.rx)}
                  {renderField("Deductible (Family)", plan.deductibleFamily)}
                  {renderField("OOPM (Family)", plan.oopmFamily)}
                </>
              )}
              {plan.category === 'Dental' && (
                <>
                  {renderField("Carrier", plan.carrier)}
                  {renderField("Plan Score", plan.score)}
                  {renderField("Value Score", plan.valueScore)}
                  {renderField("Dental Plan Type", plan.type, true)}
                  {renderField("Annual Maximum", plan.annualMax)}
                  {renderField("Preventive %", plan.preventive)}
                  {renderField("Basic %", plan.basic)}
                  {renderField("Major %", plan.major)}
                  {renderField("OON Reimbursement", plan.oonReimbursement)}
                </>
              )}
              {plan.category === 'Vision' && (
                <>
                  {renderField("Carrier", plan.carrier)}
                  {renderField("Plan Score", plan.score)}
                  {renderField("Value Score", plan.valueScore)}
                  {renderField("Vision Exam Copay", plan.examCopay)}
                  {renderField("Materials Copay", plan.materialsCopay)}
                  {renderField("Frame Allowance", plan.frameAllowance)}
                  {renderField("Materials Frequency", plan.materialsFrequency)}
                  {renderField("Frame Frequency", plan.frameFrequency)}
                </>
              )}
            </div>
          </section>

          {/* Section 2: Full Details Grouped */}
          <section className="space-y-8">
            <h3 className="text-[13px] font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
              Full Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Group 1: Deductibles */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Deductibles</h4>
                <div className="bg-neutral-50 rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-neutral-500">Individual</span>
                    <span className="text-[13px] font-bold text-neutral-900">{plan.deductible || '$50'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-neutral-500">Family</span>
                    <span className="text-[13px] font-bold text-neutral-900">{plan.deductibleFamily || '$150'}</span>
                  </div>
                </div>
              </div>

              {/* Group 2: Coverage */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Coverage</h4>
                <div className="bg-neutral-50 rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-neutral-500">Preventive Care</span>
                    <span className="text-[13px] font-bold text-neutral-900">{plan.preventive || '100%'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-neutral-500">Primary Care</span>
                    <span className="text-[13px] font-bold text-neutral-900">{plan.copay || '$25'}</span>
                  </div>
                </div>
              </div>

              {/* Group 3: Limits */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Limits</h4>
                <div className="bg-neutral-50 rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-neutral-500">Annual Maximum</span>
                    <span className="text-[13px] font-bold text-neutral-900">{plan.annualMax || 'Unlimited'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-neutral-500">Waiting Period</span>
                    <span className="text-[13px] font-bold text-neutral-900">None</span>
                  </div>
                </div>
              </div>

              {/* Group 4: Out-of-network */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Out-of-network</h4>
                <div className="bg-neutral-50 rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-neutral-500">Reimbursement</span>
                    <span className="text-[13px] font-bold text-neutral-900">{plan.oonReimbursement || '–'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-neutral-500">OON Deductible</span>
                    <span className="text-[13px] font-bold text-neutral-900">$5,000</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

const PlanCard: React.FC<{ 
  plan: BenefitPlan; 
  onViewDetails: (plan: BenefitPlan) => void;
  onViewRates: (plan: BenefitPlan) => void;
}> = ({ plan, onViewDetails, onViewRates }) => {
  const renderField = (label: string, value: string | number | undefined, isTag = false) => (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] font-medium text-neutral-500">{label}</span>
      {isTag && value ? (
        <span className="inline-flex w-fit px-2 py-0.5 rounded-sm text-[11px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
          {value}
        </span>
      ) : (
        <span className="text-[14px] font-bold text-neutral-900">{value || '–'}</span>
      )}
    </div>
  );

  return (
    <div className="bg-white border border-neutral-200 rounded-md shadow-card overflow-hidden p-6 hover:shadow-elevated transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] font-bold text-neutral-900">{plan.name}</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => onViewRates(plan)}
            className="px-4 py-1.5 text-[12px] font-bold text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-sm hover:bg-neutral-100 transition-colors"
          >
            View Rates
          </button>
          <button 
            onClick={() => onViewDetails(plan)}
            className="px-4 py-1.5 text-[12px] font-bold text-white bg-primary-600 rounded-sm hover:bg-primary-700 shadow-sm transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-y-6 gap-x-8">
        {plan.category === 'Medical' && (
          <>
            {/* Row 1 */}
            {renderField("Carrier", plan.carrier)}
            {renderField("Plan Score", plan.score)}
            {renderField("Medical Plan Type", plan.type, true)}
            {renderField("Deductible (Single)", plan.deductible)}
            {renderField("OOPM (Single)", plan.oopm)}
            {/* Row 2 */}
            {renderField("Coinsurance", plan.coinsurance)}
            {renderField("Copay", plan.copay)}
            {renderField("Rx (Combined)", plan.rx)}
            {renderField("Deductible (Family)", plan.deductibleFamily)}
            {renderField("OOPM (Family)", plan.oopmFamily)}
          </>
        )}
        {plan.category === 'Dental' && (
          <>
            {/* Row 1 */}
            {renderField("Carrier", plan.carrier)}
            {renderField("Plan Score", plan.score)}
            {renderField("Value Score", plan.valueScore)}
            {renderField("Dental Plan Type", plan.type, true)}
            {renderField("Annual Maximum", plan.annualMax)}
            {/* Row 2 */}
            {renderField("Preventive %", plan.preventive)}
            {renderField("Basic %", plan.basic)}
            {renderField("Major %", plan.major)}
            {renderField("OON Reimbursement", plan.oonReimbursement)}
          </>
        )}
        {plan.category === 'Vision' && (
          <>
            {/* Row 1 */}
            {renderField("Carrier", plan.carrier)}
            {renderField("Plan Score", plan.score)}
            {renderField("Value Score", plan.valueScore)}
            {renderField("Vision Exam Copay", plan.examCopay)}
            {renderField("Materials Copay", plan.materialsCopay)}
            {/* Row 2 */}
            {renderField("Frame Allowance", plan.frameAllowance)}
            {renderField("Materials Frequency", plan.materialsFrequency)}
            {renderField("Frame Frequency", plan.frameFrequency)}
          </>
        )}
      </div>
    </div>
  );
};

const BenefitPlans: React.FC<Props> = ({ eligibility, strategies, plans }) => {
  const [activeTab, setActiveTab] = useState<'Medical' | 'Dental' | 'Vision'>('Medical');
  const [selectedPlan, setSelectedPlan] = useState<BenefitPlan | null>(null);
  const [selectedRatesPlan, setSelectedRatesPlan] = useState<BenefitPlan | null>(null);

  if (!plans || plans.length === 0 || !eligibility) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
        <div className="flex flex-col">
          <h1 className="text-neutral-900 tracking-tight mb-2">Benefit Plans</h1>
          <p className="text-neutral-500 font-medium max-w-2xl leading-relaxed">
            Review your organization's benefit ecosystem, from coverage rules to employer contribution strategies.
          </p>
        </div>
        <EmptyState />
      </div>
    );
  }

  const filteredPlans = plans.filter(p => p.category === activeTab);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col">
        <h1 className="text-neutral-900 tracking-tight mb-2">Benefit Plans</h1>
        <p className="text-neutral-500 font-medium max-w-2xl leading-relaxed">
          Review your organization's benefit ecosystem, from coverage rules to employer contribution strategies.
        </p>
      </div>

      {/* Top Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-4 bg-white border border-neutral-200 rounded-md shadow-card p-8 flex flex-col overflow-hidden">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Benefit Eligibility</h2>
            <p className="text-[13px] text-neutral-500 font-medium mt-1">Defines who qualifies for benefits and when coverage begins.</p>
          </div>
          
          <div className="space-y-6">
            {[
              { label: 'Benefit Class', value: 'All Full-Time Employees' },
              { label: 'Waiting Period', value: 'First of month following 30 days' },
              { label: 'Eligibility Start Rule', value: 'First of month after waiting period' },
              { label: 'Minimum Weekly Hours', value: '30 hours per week' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="text-[13px] font-medium text-neutral-500 mb-1">{item.label}</div>
                <div className="text-[14px] font-bold text-neutral-900 leading-snug">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-md shadow-card overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Contribution Strategy</h2>
              <p className="text-[13px] text-neutral-500 font-medium mt-1">Displays how employer contributions are structured by strategy type, amount, and plan level across benefits.</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100">
              <thead>
                <tr className="bg-white">
                  <th className="px-8 py-4 text-left text-[13px] font-medium text-neutral-500">Benefit Line</th>
                  <th className="px-4 py-4 text-left text-[13px] font-medium text-neutral-500">Model</th>
                  <th className="px-4 py-4 text-right text-[13px] font-medium text-neutral-500">Flat Amt</th>
                  <th className="px-6 py-4 text-right text-[13px] font-medium text-neutral-500">Employee %</th>
                  <th className="px-6 py-4 text-right text-[13px] font-medium text-neutral-500">Dependent %</th>
                  <th className="px-8 py-4 text-right text-[13px] font-medium text-neutral-500">Buy-Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {strategies.map((s, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${s.benefit === 'Medical' ? 'bg-primary-500' : s.benefit === 'Dental' ? 'bg-info-500' : 'bg-warning-500'}`}></div>
                          <div className="text-[14px] font-bold text-neutral-900">{s.benefit}</div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="text-[13px] text-neutral-600 font-medium truncate max-w-[140px]" title={s.strategyType}>{s.strategyType}</div>
                      </td>
                      <td className="px-4 py-5 text-right">
                        <div className={`text-[14px] font-bold ${s.flatAmount === '$0' ? 'text-neutral-300' : 'text-neutral-900'}`}>{s.flatAmount}</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="text-[14px] font-bold text-neutral-900">{s.eePercent}</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="text-[14px] font-bold text-neutral-900">{s.depPercent}</div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${
                          s.buyUpStrategy === 'Available' ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                        }`}>
                          {s.buyUpStrategy}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-neutral-50/50 border-t border-neutral-100 text-center">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Strategy data is based on most recent enrollment cycle</span>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="pt-6">
        <div className="flex gap-10 border-b border-neutral-200 mb-8">
          {(['Medical', 'Dental', 'Vision'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[15px] font-bold tracking-tight transition-all relative ${
                activeTab === tab ? 'text-primary-600' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {filteredPlans.length > 0 ? (
            filteredPlans.map(plan => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onViewDetails={(p) => setSelectedPlan(p)}
                onViewRates={(p) => setSelectedRatesPlan(p)}
              />
            ))
          ) : (
            <div className="bg-white border border-dashed border-neutral-200 rounded-md p-24 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                 <svg className="w-10 h-10 text-neutral-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-neutral-400 font-bold text-xl tracking-tight">No {activeTab} plans mapped yet.</p>
              <p className="text-neutral-400 text-base mt-1 max-w-sm font-normal">Our benefit analysts are currently processing your plan documents. You'll be notified as soon as they're ready.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modals */}
      {selectedPlan && (
        <PlanDetailsModal 
          plan={selectedPlan} 
          onClose={() => setSelectedPlan(null)} 
        />
      )}
      {selectedRatesPlan && (
        <RatesModal 
          plan={selectedRatesPlan} 
          onClose={() => setSelectedRatesPlan(null)} 
        />
      )}
    </div>
  );
};

export default BenefitPlans;
