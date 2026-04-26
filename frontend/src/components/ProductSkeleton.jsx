import React from 'react';

const ProductSkeleton = () => {
  return (
    <div className="card-premium">
      <div className="w-full aspect-square skeleton"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 skeleton"></div>
        <div className="h-3 w-1/2 skeleton opacity-60"></div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-1/4 skeleton"></div>
          <div className="h-8 w-8 rounded-full skeleton"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
