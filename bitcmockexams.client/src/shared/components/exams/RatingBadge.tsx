import React from 'react';
import { FaStar } from 'react-icons/fa';

interface Props {
  rating: number;
}

const RatingBadge: React.FC<Props> = ({ rating }) => {
  return (
    <div className="flex items-center gap-2 font-semibold text-text-primary px-3 py-2 rounded-lg bg-orange-50 border border-orange-100">
      <FaStar className="text-orange-400 text-base" />
      <span>{rating}</span>
    </div>
  );
};

export default RatingBadge;
