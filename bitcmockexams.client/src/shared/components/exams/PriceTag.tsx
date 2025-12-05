import React from 'react';

interface Props {
  price: number;
}

const PriceTag: React.FC<Props> = ({ price }) => {
  return (
    <div className="text-[30px] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-teal-400">
      ${price.toFixed(2)}
    </div>
  );
};

export default PriceTag;
