// Admin Reports & Export Page
import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText, Filter, Table } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getAllMembersForExport } from '@/firebase/firestore';
import AdminLayout from '@/layouts/AdminLayout';
import { GlassCard, GoldButton, SelectField } from '@/components/ui';
import { DISTRICTS } from '@/constants/districts';
import { CATEGORIES, GENDERS } from '@/constants/app';
import { prepareMembersForExport, exportAsPDF } from '@/utils/helpers';

const AdminReports = () => {
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    district: '',
    category: '',
    gender: '',
  });

  const getFilteredData = async () => {
    const activeFilters = { ...filters };
    Object.keys(activeFilters).forEach(k => {
      if (!activeFilters[k]) delete activeFilters[k];
    });
    const members = await getAllMembersForExport(activeFilters);
    return prepareMembersForExport(members);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const data = await getFilteredData();
      if (!data.length) {
        toast.error('No members match the selected filters');
        return;
      }
      exportAsPDF(data, `TNSA_Member_Report_${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success('PDF Report exported');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const data = await getFilteredData();
      if (!data.length) {
        toast.error('No members match the selected filters');
        return;
      }
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'TNSA Members');
      XLSX.writeFile(workbook, `TNSA_Member_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
      toast.success('Excel Report exported');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-6 py-6 space-y-6 pb-20 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Exports</h1>
          <p className="text-sm text-white/50">Filter, compile, and download membership database lists</p>
        </div>

        <GlassCard className="p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Filter size={18} className="text-gold" />
            Configure Export Filters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="District"
              value={filters.district}
              onChange={(e) => setFilters(p => ({ ...p, district: e.target.value }))}
              options={DISTRICTS.map(d => d.name)}
              placeholder="All Districts"
            />
            <SelectField
              label="Category"
              value={filters.category}
              onChange={(e) => setFilters(p => ({ ...p, category: e.target.value }))}
              options={CATEGORIES}
              placeholder="All Categories"
            />
            <SelectField
              label="Gender"
              value={filters.gender}
              onChange={(e) => setFilters(p => ({ ...p, gender: e.target.value }))}
              options={GENDERS}
              placeholder="All Genders"
            />
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3 justify-end">
            <GoldButton
              variant="ghost"
              onClick={handleExportPDF}
              loading={exporting}
              icon={<FileText size={16} />}
            >
              Export as PDF
            </GoldButton>
            <GoldButton
              onClick={handleExportExcel}
              loading={exporting}
              icon={<FileSpreadsheet size={16} />}
            >
              Export as Excel (.xlsx)
            </GoldButton>
          </div>
        </GlassCard>

        {/* Database Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Table size={18} className="text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Permanent Logs</p>
              <p className="text-xs text-white/50 mt-0.5">IDs and Counters cannot be rolled back or deleted.</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <BarChart3 size={18} className="text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Real-Time Sync</p>
              <p className="text-xs text-white/50 mt-0.5">All updates immediately sync with the central database.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
