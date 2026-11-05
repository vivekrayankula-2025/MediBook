import { format, parseISO } from 'date-fns';

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    // If format is YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return format(new Date(year, month - 1, day), 'EEEE, MMMM d, yyyy');
    }
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch (e) {
    return dateStr;
  }
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
  } catch (e) {
    return timeStr;
  }
};

export const formatCurrency = (amount) => {
  // Indian Rupees with lakh/crore grouping, e.g. ₹1,50,000
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone;
};
