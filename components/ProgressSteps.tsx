import React from 'react';
import { ProgressStep, ProgressStatus } from '@/types';

interface Props {
  steps: ProgressStep[];
}

const ProgressSteps: React.FC<Props> = ({ steps }) => {
  const getStatusStyle = (status: ProgressStatus) => {
    switch (status) {
      case ProgressStatus.APPROVED:
        return 'bg-info-bg text-info-500 border-info-500/20';
      case ProgressStatus.IN_REVIEW:
        return 'bg-success-bg text-success-500 border-success-500/20';
      case ProgressStatus.FLAGGED:
        return 'bg-error-bg text-error-500 border-error-500/20';
      case ProgressStatus.MISSING:
        return 'bg-warning-bg text-warning-500 border-warning-500/20';
      case ProgressStatus.NOT_REQUESTED:
        return 'bg-neutral-100 text-neutral-500 border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-500 border-neutral-200';
    }
  };

  const getStatusDisplay = (status: ProgressStatus): string => {
    switch (status) {
      case ProgressStatus.APPROVED:
        return 'Complete';
      case ProgressStatus.MISSING:
        return 'Not Started';
      case ProgressStatus.NOT_REQUESTED:
        return 'Not Requested';
      default:
        return status;
    }
  };

  return (
    <section className="bg-white border border-neutral-200 rounded-md overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-8 py-4 text-left text-[13px] font-medium text-neutral-500">Step</th>
              <th className="px-8 py-4 text-left text-[13px] font-medium text-neutral-500">Category</th>
              <th className="px-8 py-4 text-left text-[13px] font-medium text-neutral-500">Status</th>
              <th className="px-8 py-4 text-right text-[13px] font-medium text-neutral-500">Last Updated</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {steps.length > 0 ? (
              steps.map((step) => (
                <tr key={step.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap max-w-xs">
                    <div className="text-[15px] font-bold text-neutral-900 tracking-tight">{step.name}</div>
                    {step.notes && <div className="text-[13px] text-neutral-500 font-normal mt-0.5 truncate" title={step.notes}>{step.notes}</div>}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-[14px] text-neutral-600 font-normal">{step.category}</td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-[11px] font-bold border rounded-sm tracking-wide ${getStatusStyle(step.status)}`}>
                      {getStatusDisplay(step.status)}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-[13px] text-neutral-500 font-medium">{step.lastUpdated || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-neutral-500">No progress steps available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProgressSteps;
