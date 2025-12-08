import React from 'react';

type SkeletonProps = {
  className?: string;
  rounded?: string;
};

const Skeleton: React.FC<SkeletonProps> = ({ className = '', rounded = 'rounded-md' }) => {
  return (
    <div className={`skeleton ${rounded} ${className}`} aria-hidden="true" />
  );
};

export default Skeleton;
