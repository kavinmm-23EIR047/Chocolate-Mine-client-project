import React from 'react';
import EmptyState from './EmptyState';
import { CardSkeleton } from './Skeleton';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

/**
 * UIStateContainer - A wrapper component to manage the 10 UI states
 * (Loading, Empty, Error, Offline, Content/Default) with theme consistency.
 */
const UIStateContainer = ({
  isLoading = false,
  isError = false,
  errorMessage = "Something went wrong while loading data.",
  isEmpty = false,
  emptyTitle = "No items found",
  emptyMessage = "There are no items to display at this moment.",
  emptyIcon,
  emptyAction,
  onRetry,
  skeletonCount = 4,
  skeletonComponent: SkeletonComponent = CardSkeleton,
  children
}) => {
  // 1. Loading State
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonComponent key={i} />
        ))}
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <div className="neo-card bg-error-light border border-error/30 text-error-text rounded-3xl p-8 my-8 text-center max-w-lg mx-auto shadow-sm">
        <div className="w-14 h-14 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={30} />
        </div>
        <h4 className="text-lg font-bold text-error mb-2">Unable to Load Data</h4>
        <p className="text-sm opacity-90 mb-6">{errorMessage}</p>
        {onRetry && (
          <Button 
            variant="danger"
            size="sm"
            onClick={onRetry}
            icon={RefreshCw}
          >
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // 3. Empty State
  if (isEmpty) {
    return (
      <EmptyState 
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
      />
    );
  }

  // 4. Default Content State
  return <>{children}</>;
};

export default UIStateContainer;
