import React from 'react';

// Order Statuses - Theme bound for Light & Dark mode
export const ORDER_STATUSES = {
  confirmed: {
    label: 'Confirmed',
    color: 'bg-info-light text-info-text border border-info/30',
    dot: 'bg-info'
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-warning-light text-warning-text border border-warning/30',
    dot: 'bg-warning'
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-success-light text-success-text border border-success/30',
    dot: 'bg-success'
  },
  cancelled: {
    label: 'Payment Cancelled',
    color: 'bg-error-light text-error-text border border-error/30',
    dot: 'bg-error'
  }
};

// Payment Statuses
export const PAYMENT_STATUSES = {
  pending: {
    label: 'Pending',
    color: 'bg-warning-light text-warning-text border border-warning/30'
  },
  created: {
    label: 'Created',
    color: 'bg-card-soft text-heading border border-border'
  },
  paid: {
    label: 'Paid',
    color: 'bg-success-light text-success-text border border-success/30'
  },
  failed: {
    label: 'Failed',
    color: 'bg-error-light text-error-text border border-error/30'
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-info-light text-info-text border border-info/30'
  }
};

// Kitchen Statuses (Legacy - kept for compatibility)
export const KITCHEN_STATUSES = {
  pending: {
    label: 'Pending',
    color: 'bg-warning-light text-warning-text border border-warning/30'
  },
  preparing: {
    label: 'Preparing',
    color: 'bg-info-light text-info-text border border-info/30'
  },
  ready: {
    label: 'Ready',
    color: 'bg-success-light text-success-text border border-success/30'
  }
};

export const OrderStatusBadge = ({ status }) => {
  const config = ORDER_STATUSES[status] || ORDER_STATUSES.confirmed;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export const PaymentStatusBadge = ({ status }) => {
  const config = PAYMENT_STATUSES[status] || PAYMENT_STATUSES.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

export const KitchenStatusBadge = ({ status }) => {
  const config = KITCHEN_STATUSES[status] || KITCHEN_STATUSES.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};