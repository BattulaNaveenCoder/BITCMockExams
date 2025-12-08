import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { MockExam } from '../../../types';
import Button from '@shared/components/ui/Button';
import DifficultyBadge from './DifficultyBadge';
import ExamStats from './ExamStats';
import RatingBadge from './RatingBadge';
import PriceTag from './PriceTag';

interface Props {
  exam: MockExam;
}

const ExamCard: React.FC<Props> = ({ exam }) => {
  const navigate = useNavigate();
  return (
    <div
      className="relative flex flex-col h-full rounded-2xl p-6 bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
      style={{
        boxShadow:
          '0 1px 3px rgba(0,0,0,0.06), 0 10px 20px rgba(30,64,175,0.08)'
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <span className="flex items-center gap-2 text-primary-blue font-semibold text-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-sky-400"></span>
          {exam.vendor}
        </span>
        <DifficultyBadge difficulty={exam.difficulty} />
      </div>

      <div className="flex items-start justify-between mb-6">
        <h3 className="text-[28px] font-bold text-text-primary m-0 leading-tight">
          {exam.title}
        </h3>
        {exam.image ? (
          <img
            src={exam.image}
            alt={`${exam.code} badge`}
            className="w-16 h-16 object-contain ml-4"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="min-h-[170px]">
        <ExamStats questions={exam.questions} duration={exam.duration} students={exam.students} />
        <div className="flex justify-between items-center mt-4">
          <RatingBadge rating={exam.rating} />
          {/* <PriceTag price={exam.price} /> */}
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Button
          variant="primary"
          fullWidth
          className="rounded-full h-12 text-base font-semibold shadow-[0_8px_24px_rgba(28,100,242,0.25)] bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
          onClick={() => {
            const qp = new URLSearchParams();
            if (exam.suiteId) qp.set('suiteId', exam.suiteId);
            if (exam.pathId) qp.set('pathId', exam.pathId);
            navigate(`/exams/${exam.code}/topics${qp.toString() ? `?${qp.toString()}` : ''}`);
          }}
        >
          Start Practice
        </Button>
      </div>
    
    </div>
  );
};

export default ExamCard;
