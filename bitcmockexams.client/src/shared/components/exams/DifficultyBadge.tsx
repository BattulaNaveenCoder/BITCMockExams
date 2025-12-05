import React from 'react';

interface Props {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
}

const getDifficultyColorClass = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-700';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-700';
    case 'advanced':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getDifficultyBadgeText = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'BEGINNER';
    case 'Intermediate':
      return 'INTERMEDIATE';
    case 'Advanced':
      return 'ADVANCED';
    default:
      return difficulty.toUpperCase();
  }
};

const DifficultyBadge: React.FC<Props> = ({ difficulty }) => {
  const color = getDifficultyColorClass(difficulty);
  const text = getDifficultyBadgeText(difficulty);
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${color}`}>
      {text}
    </span>
  );
};

export default DifficultyBadge;
