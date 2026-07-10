// Utility helper functions for TNSA app
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { jsPDF } from 'jspdf';

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
 * Export data as PDF file
 */
export const exportAsPDF = (data, filename = 'members.pdf') => {
  if (!data.length) return;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const columns = [
    { header: 'S.No', key: 'sno', width: 12 },
    { header: 'Membership ID', key: 'Membership ID', width: 35 },
    { header: 'Name', key: 'Name', width: 45 },
    { header: 'District', key: 'District', width: 35 },
    { header: 'Category', key: 'Category', width: 30 },
    { header: 'Mobile', key: 'Mobile', width: 30 },
    { header: 'Club Name', key: 'Club Name', width: 50 },
    { header: 'Status', key: 'Status', width: 25 }
  ];

  let pageNumber = 1;
  const startX = 15;
  const startY = 35;
  let currentY = startY;
  const rowHeight = 8;
  const pageHeight = 210;
  const bottomMargin = 15;

  const drawHeader = () => {
    // Report Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(212, 175, 55); // Gold color (#D4AF37)
    doc.text('TAMILNADU SILAMBATTAM ASSOCIATION (TNSA)', 15, 15);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Membership Directory — Generated on ${format(new Date(), 'dd MMM yyyy')}`, 15, 21);

    // Draw thin gold line under title
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(15, 24, 282, 24);

    // Draw Table Headers
    doc.setFillColor(26, 26, 26); // Dark primary color
    doc.rect(startX, 28, 267, rowHeight, 'F');
    
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(255, 255, 255);

    let x = startX;
    columns.forEach(col => {
      // Center S.No and Status
      if (col.key === 'sno' || col.key === 'Status') {
        doc.text(col.header, x + col.width / 2, 28 + 5, { align: 'center' });
      } else {
        doc.text(col.header, x + 2, 28 + 5);
      }
      x += col.width;
    });

    currentY = startY + 1;
  };

  const drawFooter = () => {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${pageNumber}`, 282, pageHeight - 8, { align: 'right' });
    doc.text('TNSA Official Membership Database Report', 15, pageHeight - 8);
  };

  drawHeader();
  drawFooter();

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);

  data.forEach((row, index) => {
    // Check if we need a new page
    if (currentY + rowHeight > pageHeight - bottomMargin) {
      doc.addPage();
      pageNumber++;
      drawHeader();
      drawFooter();
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
    }

    // Draw Zebra striping
    if (index % 2 === 1) {
      doc.setFillColor(245, 245, 245);
      doc.rect(startX, currentY, 267, rowHeight, 'F');
    }

    // Draw row cell borders
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.1);
    doc.line(startX, currentY + rowHeight, startX + 267, currentY + rowHeight);

    let x = startX;
    columns.forEach(col => {
      let val = col.key === 'sno' ? String(index + 1) : String(row[col.key] || '—');
      
      // Clean status values
      if (col.key === 'Status') {
        val = val.toUpperCase();
        if (val === 'ACTIVE') doc.setTextColor(34, 197, 94); // Green
        else if (val === 'INACTIVE') doc.setTextColor(239, 68, 68); // Red
        else doc.setTextColor(234, 179, 8); // Yellow
      } else {
        doc.setTextColor(50, 50, 50);
      }

      // Truncate to fit column width
      const maxChars = Math.floor(col.width * 1.3);
      if (val.length > maxChars) {
        val = val.slice(0, maxChars - 2) + '..';
      }

      if (col.key === 'sno' || col.key === 'Status') {
        doc.text(val, x + col.width / 2, currentY + 5, { align: 'center' });
      } else {
        doc.text(val, x + 2, currentY + 5);
      }
      x += col.width;
    });

    currentY += rowHeight;
  });

  // Save the PDF
  doc.save(filename);
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
