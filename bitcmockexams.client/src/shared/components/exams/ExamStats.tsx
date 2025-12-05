import React from 'react';

interface Props {
  questions: number;
  duration: number; // minutes
  students: number;
}

const ExamStats: React.FC<Props> = ({ questions, duration, students }) => {
  return (
    <div className="rounded-xl p-5 mb-6 border border-gray-200/60 bg-gray-50">
      <div className="flex justify-between items-center py-3 border-b border-gray-200">
        <span className="flex items-center gap-2 text-text-secondary text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-teal-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5h6M9 9h6M9 13h6m-9 4h9M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
          </svg>
          Questions
        </span>
        <span className="text-text-primary font-semibold text-sm">{questions}</span>
      </div>
      <div className="flex justify-between items-center py-3 border-b border-gray-200">
        <span className="flex items-center gap-2 text-text-secondary text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-teal-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v5l3 3M12 22a10 10 0 100-20 10 10 0 000 20z" />
          </svg>
          Duration
        </span>
        <span className="text-text-primary font-semibold text-sm">{duration} min</span>
      </div>
      <div className="flex justify-between items-center py-3">
        <span className="flex items-center gap-2 text-text-secondary text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-teal-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-4-4h-1M7 20H2v-2a4 4 0 014-4h1m10-6a4 4 0 11-8 0 4 4 0 018 0M8 8a4 4 0 118 0" />
          </svg>
          Students
        </span>
        <span className="text-text-primary font-semibold text-sm">{students.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default ExamStats;
