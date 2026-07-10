// Admin Members Management Page
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Edit2, Trash2, Download, Printer, Plus, X, ShieldAlert, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMembers, deleteUser, searchMembers } from '@/firebase/firestore';
import AdminLayout from '@/layouts/AdminLayout';
import { GlassCard, Avatar, Badge, GoldButton, InputField, SelectField } from '@/components/ui';
import { DISTRICTS } from '@/constants/districts';
import { CATEGORIES, GENDERS } from '@/constants/app';
import { formatDate } from '@/utils/helpers';

const AdminMembers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name'); // name, membershipId, mobile, aadhaar
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    district: '',
    category: '',
    gender: '',
    status: '',
  });

  // Pagination states
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMembers = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const activeFilters = { ...filters };
      Object.keys(activeFilters).forEach(key => {
        if (!activeFilters[key]) delete activeFilters[key];
      });

      const result = await getMembers(activeFilters, 15, loadMore ? lastVisible : null);
      
      if (loadMore) {
        setMembers(prev => [...prev, ...result.members]);
      } else {
        setMembers(result.members);
      }
      
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      fetchMembers();
    }
  }, [filters, searchTerm]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchMembers();
      return;
    }
    setLoading(true);
    try {
      // Custom prefix search using firestore helper
      const results = await searchMembers(searchField, searchTerm.trim());
      setMembers(results);
      setHasMore(false);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uid) => {
    if (window.confirm('Are you sure you want to delete this member? This action is permanent and IDs are not reused.')) {
      try {
        await deleteUser(uid);
        toast.success('Member soft deleted');
        setMembers(prev => prev.filter(m => m.uid !== uid));
      } catch (err) {
        toast.error('Failed to delete member');
      }
    }
  };

  const resetFilters = () => {
    setFilters({
      district: '',
      category: '',
      gender: '',
      status: '',
    });
    setSearchTerm('');
  };

  return (
    <AdminLayout>
      <div className="px-6 py-6 space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Member Directory</h1>
            <p className="text-sm text-white/50">View and manage all association members</p>
          </div>
          <button
            onClick={() => navigate('/register')}
            className="btn-gold flex items-center justify-center gap-2 self-start sm:self-auto touch-target px-4 py-2 text-sm"
          >
            <Plus size={16} />
            <span>Add New Member</span>
          </button>
        </div>

        {/* Search Bar & Filter Toggle */}
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <SelectField
              placeholder="Search by"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              options={[
                { value: 'name', label: 'Name' },
                { value: 'membershipId', label: 'Member ID' },
                { value: 'mobile', label: 'Mobile' },
                { value: 'aadhaar', label: 'Aadhaar' },
              ]}
              className="w-36 flex-shrink-0"
            />
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={`Search for member...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-gold pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            </div>
            <GoldButton type="submit" size="sm">Search</GoldButton>
          </form>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-ghost flex items-center justify-center gap-2 px-4 py-2 text-sm touch-target self-start md:self-auto"
          >
            <Filter size={16} className={showFilters ? 'text-gold' : 'text-white/60'} />
            <span>Filters</span>
          </button>
        </div>

        {/* Expandable Filter Drawer/Box */}
        {showFilters && (
          <GlassCard className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            <SelectField
              label="District"
              value={filters.district}
              onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
              options={DISTRICTS.map(d => d.name)}
              placeholder="All Districts"
            />
            <SelectField
              label="Category"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              options={CATEGORIES}
              placeholder="All Categories"
            />
            <SelectField
              label="Gender"
              value={filters.gender}
              onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
              options={GENDERS}
              placeholder="All Genders"
            />
            <SelectField
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              options={['active', 'inactive', 'pending']}
              placeholder="All Statuses"
            />
            <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-3 pt-2">
              <button onClick={resetFilters} className="text-sm text-white/40 hover:text-white transition-all">
                Reset Filters
              </button>
            </div>
          </GlassCard>
        )}

        {/* Directory Table */}
        <GlassCard className="overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs font-semibold text-white/60 tracking-wider">
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Member ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Club Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-4"><div className="w-8 h-8 rounded-full shimmer" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-16 rounded shimmer" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-24 rounded shimmer" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-20 rounded shimmer" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-20 rounded shimmer" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-24 rounded shimmer" /></td>
                      <td className="px-4 py-4"><div className="h-6 w-14 rounded-full shimmer" /></td>
                      <td className="px-4 py-4"><div className="h-6 w-20 rounded shimmer ml-auto" /></td>
                    </tr>
                  ))
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-white/30 text-sm">
                      No members found matching criteria.
                    </td>
                  </tr>
                ) : (
                  members.map(member => (
                    <tr key={member.id} className="table-row">
                      <td className="px-4 py-3">
                        <Avatar src={member.photoURL} name={member.name} size="sm" />
                      </td>
                      <td className="px-4 py-3 font-semibold text-gold tracking-wide">{member.membershipId}</td>
                      <td className="px-4 py-3 text-white font-medium">{member.name}</td>
                      <td className="px-4 py-3 text-white/70">{member.district}</td>
                      <td className="px-4 py-3 text-white/60">{member.mobile}</td>
                      <td className="px-4 py-3 text-white/60">{member.clubName}</td>
                      <td className="px-4 py-3">
                        <Badge variant={member.status}>{member.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/admin/members/${member.id}`)}
                            title="View Detail"
                            className="p-2 text-white/50 hover:text-gold hover:bg-white/5 rounded-lg transition-all touch-target"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/members/${member.id}?edit=true`)}
                            title="Edit"
                            className="p-2 text-white/50 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-all touch-target"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            title="Delete"
                            className="p-2 text-white/50 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all touch-target"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="p-4 flex justify-center border-t border-white/5">
              <GoldButton
                variant="ghost"
                onClick={() => fetchMembers(true)}
                loading={loadingMore}
                size="sm"
              >
                Load More Members
              </GoldButton>
            </div>
          )}
        </GlassCard>
      </div>
    </AdminLayout>
  );
};

export default AdminMembers;
