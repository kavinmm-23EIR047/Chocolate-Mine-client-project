export const safeFormatDate = (dateInput) => {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    const fixedDate = new Date(typeof dateInput === 'string' ? dateInput.replace(' ', 'T') : dateInput);
    if (!isNaN(fixedDate.getTime())) return fixedDate.toLocaleString();
    return 'Invalid Date';
  }
  return date.toLocaleString();
};

export const safeFormatDateString = (dateInput, options = {}) => {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    const fixedDate = new Date(typeof dateInput === 'string' ? dateInput.replace(' ', 'T') : dateInput);
    if (!isNaN(fixedDate.getTime())) return fixedDate.toLocaleDateString(undefined, options);
    return 'Invalid Date';
  }
  return date.toLocaleDateString(undefined, options);
};

export const safeFormatTimeString = (dateInput, options = {}) => {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    const fixedDate = new Date(typeof dateInput === 'string' ? dateInput.replace(' ', 'T') : dateInput);
    if (!isNaN(fixedDate.getTime())) return fixedDate.toLocaleTimeString(undefined, options);
    return 'Invalid Date';
  }
  return date.toLocaleTimeString(undefined, options);
};
