import React from 'react';

interface GlassdoorData {
    overallRating?: number;
    benefitsRating?: number;
    healthInsuranceRating?: number;
    totalReviews?: number;
}

interface Props {
    data?: GlassdoorData;
}

export default function GlassdoorInsights({ data }: Props) {
    const glassdoorData = data || {
        overallRating: 0,
        benefitsRating: 0,
        healthInsuranceRating: 0,
        totalReviews: 0,
    };

    const hasData = glassdoorData.totalReviews && glassdoorData.totalReviews > 0;

    return (
        <div className="bg-primary-900 rounded-md p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-[20px] font-bold mb-1">Glassdoor Insights</h2>
                        <p className="text-primary-400 text-[13px]">External reputation signals and ratings</p>
                    </div>
                    {hasData && (
                        <div className="text-right">
                            <div className="text-[32px] font-bold">{glassdoorData.overallRating?.toFixed(1)}</div>
                            <div className="text-[12px] text-primary-300">Overall Rating</div>
                        </div>
                    )}
                </div>

                {hasData ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <span className="text-[12px] font-bold text-primary-400 uppercase tracking-wider block mb-2">
                                Benefits Rating
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[24px] font-bold">{glassdoorData.benefitsRating?.toFixed(1)}</span>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                            key={star}
                                            className={`w-4 h-4 ${star <= (glassdoorData.benefitsRating || 0) ? 'text-yellow-400' : 'text-primary-700'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <span className="text-[12px] font-bold text-primary-400 uppercase tracking-wider block mb-2">
                                Health Insurance
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[24px] font-bold">{glassdoorData.healthInsuranceRating?.toFixed(1)}</span>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                            key={star}
                                            className={`w-4 h-4 ${star <= (glassdoorData.healthInsuranceRating || 0) ? 'text-yellow-400' : 'text-primary-700'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <span className="text-[12px] font-bold text-primary-400 uppercase tracking-wider block mb-2">
                                Total Reviews
                            </span>
                            <span className="text-[24px] font-bold">{glassdoorData.totalReviews?.toLocaleString()}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-primary-300 text-[14px]">
                            Glassdoor data will be available once company profile is enriched.
                        </p>
                    </div>
                )}
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mb-10"></div>
        </div>
    );
}
