// Utility helper functions for TNSA app
import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format a Firestore Timestamp or Date to display string
 */
export const formatDate = (timestamp, fmt = 'dd MMM yyyy') => {
  if (!timestamp) return 'N/A';
  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, fmt);
  } catch {
    return 'N/A';
  }
};

/**
 * Format date for membership card (DD/MM/YYYY)
 */
export const formatCardDate = (timestamp) => {
  return formatDate(timestamp, 'dd/MM/yyyy');
};

/**
 * Format date as "2 days ago", "3 months ago", etc.
 */
export const timeAgo = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '';
  }
};

/**
 * Format Aadhaar number for display: XXXX XXXX XXXX
 */
export const maskAadhaar = (aadhaar) => {
  if (!aadhaar || aadhaar.length !== 12) return aadhaar || 'N/A';
  return `XXXX XXXX ${aadhaar.slice(8)}`;
};

/**
 * Format full Aadhaar with spaces: 1234 5678 9012
 */
export const formatAadhaar = (aadhaar) => {
  if (!aadhaar) return 'N/A';
  return aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
};

/**
 * Capitalize first letter of each word
 */
export const titleCase = (str) => {
  if (!str) return '';
  return str.replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * Get initials from name (for avatar fallback)
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
};

/**
 * Download a canvas or image as PNG file
 */
export const downloadAsImage = (dataUrl, filename = 'membership-card.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
};

/**
 * Get status badge class
 */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'active':   return 'badge-active';
    case 'inactive': return 'badge-inactive';
    case 'pending':  return 'badge-pending';
    default:         return 'badge-gold';
  }
};

/**
 * Truncate long strings
 */
export const truncate = (str, maxLen = 30) => {
  if (!str) return '';
  return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;
};

/**
 * Format phone number for display
 */
export const formatPhone = (phone) => {
  if (!phone) return 'N/A';
  return phone.replace(/(\d{5})(\d{5})/, '$1 $2');
};

/**
 * Export data as CSV file
 */
export const exportAsCSV = (data, filename = 'members.csv') => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row =>
    Object.values(row).map(v =>
      typeof v === 'string' && v.includes(',') ? `"${v}"` : v
    ).join(',')
  ).join('\n');

  const csv = `${headers}\n${rows}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Convert members for export (flatten Firestore timestamps, remove sensitive data)
 */
export const prepareMembersForExport = (members) => {
  return members.map(m => ({
    'Membership ID':  m.membershipId || '',
    'Name':           m.name || '',
    'Father Name':    m.fatherName || '',
    'Date of Birth':  formatDate(m.dob, 'dd/MM/yyyy'),
    'Gender':         m.gender || '',
    'Mobile':         m.mobile || '',
    'Email':          m.email || '',
    'District':       m.district || '',
    'District Code':  m.districtCode || '',
    'Club Name':      m.clubName || '',
    'Position':       m.position || '',
    'Category':       m.category || '',
    'Status':         m.status || '',
    'Registered On':  formatDate(m.createdAt),
  }));
};
