export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  packed: { label: 'Packed', color: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
};

export const KITCHEN_STATUSES = {
  pending: { label: 'New', color: 'bg-yellow-100 text-yellow-800' },
  preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800' },
  packed: { label: 'Packed', color: 'bg-blue-100 text-blue-800' },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800' },
  dispatched: { label: 'Dispatched', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800' },
};

export const PAYMENT_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  created: { label: 'Created', color: 'bg-blue-100 text-blue-800' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
};

export const CATEGORIES = [
  { value: 'cakes', label: 'Cakes', emoji: '🎂' },
  { value: 'chocolates', label: 'Chocolates', emoji: '🍫' },
  { value: 'flowers', label: 'Flowers', emoji: '💐' },
  { value: 'gifts', label: 'Gifts', emoji: '🎁' },
];

export const OCCASIONS = [
  { value: 'birthday', label: 'Birthday Gift' },
  { value: 'anniversary', label: 'Anniversary Gift' },
  { value: 'him', label: 'Gifts for Him' },
  { value: 'her', label: 'Gifts for Her' },
];

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export const ROLE_REDIRECTS = {
  user: '/',
  admin: '/admin/dashboard',
  staff: '/staff/dashboard',
};
