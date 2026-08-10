import React from 'react';

// Order Statuses - Theme bound for Light & Dark mode (Dark BG + Light Text)
export const ORDER_STATUSES = {
  awaiting_payment: {
    label: 'Awaiting Payment',
    color: 'bg-orange-700 text-white font-black border border-orange-600 shadow-xs',
    dot: 'bg-white'
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-sky-700 text-white font-black border border-sky-600 shadow-xs',
    dot: 'bg-white'
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-amber-700 text-white font-black border border-amber-600 shadow-xs',
    dot: 'bg-white'
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-emerald-700 text-white font-black border border-emerald-600 shadow-xs',
    dot: 'bg-white'
  },
  cancelled: {
    label: 'Payment Cancelled',
    color: 'bg-rose-700 text-white font-black border border-rose-600 shadow-xs',
    dot: 'bg-white'
  }
};

// Payment Statuses (Dark BG + Light Text)
export const PAYMENT_STATUSES = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-700 text-white font-black border border-amber-600 shadow-xs'
  },
  created: {
    label: 'Created',
    color: 'bg-slate-700 text-white font-black border border-slate-600 shadow-xs'
  },
  paid: {
    label: 'Paid',
    color: 'bg-emerald-700 text-white font-black border border-emerald-600 shadow-xs'
  },
  failed: {
    label: 'Failed',
    color: 'bg-rose-700 text-white font-black border border-rose-600 shadow-xs'
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-sky-700 text-white font-black border border-sky-600 shadow-xs'
  }
};

// Kitchen Statuses (Dark BG + Light Text)
export const KITCHEN_STATUSES = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-700 text-white font-black border border-amber-600 shadow-xs'
  },
  preparing: {
    label: 'Preparing',
    color: 'bg-sky-700 text-white font-black border border-sky-600 shadow-xs'
  },
  ready: {
    label: 'Ready',
    color: 'bg-emerald-700 text-white font-black border border-emerald-600 shadow-xs'
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