// Admin Dashboard Page — Analytics, charts, and metrics
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Calendar, Map, CreditCard, Loader2, ArrowRight } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  getMemberCount,
  getTodayRegistrations,
  getMembersByDistrict,
  getMonthlyRegistrations,
  getMembers,
} from '@/firebase/firestore';
import AdminLayout from '@/layouts/AdminLayout';
import { StatsCard, GlassCard, LoadingSkeleton } from '@/components/ui';

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalMembers: 0,
    todayRegs: 0,
    activeMembers: 0,
    districtsCount: 0,
    cardsGenerated: 0,
  });
  const [districtData, setDistrictData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});
  const [genderData, setGenderData] = useState({ Male: 0, Female: 0, Other: 0 });
  const [categoryData, setCategoryData] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch Metrics
        const total = await getMemberCount();
        const today = await getTodayRegistrations();
        const districtDist = await getMembersByDistrict();
        const monthlyDist = await getMonthlyRegistrations();

        // Let's get actual members to compute gender, category, active count
        const { members } = await getMembers({}, 1000); // fetch up to 1000 for simple stats
        
        let active = 0;
        let genders = { Male: 0, Female: 0, Other: 0 };
        let categories = {};
        
        members.forEach(m => {
          if (m.status === 'active') active++;
          if (m.gender) genders[m.gender] = (genders[m.gender] || 0) + 1;
          if (m.category) categories[m.category] = (categories[m.category] || 0) + 1;
        });

        const uniqueDistricts = Object.keys(districtDist).length;

        setMetrics({
          totalMembers: total,
          todayRegs: today,
          activeMembers: active,
          districtsCount: uniqueDistricts,
          cardsGenerated: active, // Cards generated matches active profiles
        });

        setDistrictData(districtDist);
        setMonthlyData(monthlyDist);
        setGenderData(genders);
        setCategoryData(categories);

      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Line chart: Monthly registrations
  const lineChartData = {
    labels: Object.keys(monthlyData).map(k => {
      const [year, month] = k.split('-');
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'short' });
    }),
    datasets: [
      {
        label: 'Registrations',
        data: Object.values(monthlyData),
        borderColor: '#D4AF37',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Bar chart: District distribution
  const barChartData = {
    labels: Object.keys(districtData),
    datasets: [
      {
        label: 'Members',
        data: Object.values(districtData),
        backgroundColor: '#D4AF37',
        borderRadius: 4,
      },
    ],
  };

  // Doughnut chart: Gender ratio
  const doughnutChartData = {
    labels: Object.keys(genderData),
    datasets: [
      {
        data: Object.values(genderData),
        backgroundColor: ['#D4AF37', '#ffffff', '#525252'],
        borderWidth: 0,
      },
    ],
  };

  // Pie chart: Category distribution
  const pieChartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          '#D4AF37',
          '#A88B2A',
          '#F0C940',
          '#ffffff',
          '#737373',
          '#404040',
          '#171717',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: { family: 'Poppins' },
        },
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { family: 'Poppins' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { family: 'Poppins' } },
      },
    },
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: { family: 'Poppins', size: 11 },
        },
      },
    },
  };

  return (
    <AdminLayout>
      <div className="px-6 py-6 space-y-6 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">TNSA Analytics</h1>
            <p className="text-sm text-white/50">Tamilnadu Silambattam Association management overview</p>
          </div>
          <button
            onClick={() => navigate('/admin/members')}
            className="btn-gold flex items-center justify-center gap-2 self-start md:self-auto touch-target px-4 py-2 text-sm"
          >
            <span>Manage Members</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-4 space-y-2">
                <div className="w-10 h-10 rounded-full shimmer" />
                <div className="h-6 w-12 rounded shimmer" />
                <div className="h-3 w-20 rounded shimmer" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatsCard icon={<Users size={20} />} label="Total Members" value={metrics.totalMembers} color="gold" />
            <StatsCard icon={<Calendar size={20} />} label="Today's Registrations" value={metrics.todayRegs} color="blue" />
            <StatsCard icon={<Map size={20} />} label="Total Districts" value={metrics.districtsCount} color="purple" />
            <StatsCard icon={<UserCheck size={20} />} label="Active Members" value={metrics.activeMembers} color="green" />
            <StatsCard icon={<CreditCard size={20} />} label="Generated Cards" value={metrics.cardsGenerated} color="gold" />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 h-64 shimmer" />
            <div className="glass-card p-6 h-64 shimmer" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line: Monthly registration */}
              <GlassCard className="p-6">
                <h3 className="text-sm font-bold text-white mb-4">Monthly Registrations</h3>
                <div className="h-64">
                  {Object.keys(monthlyData).length > 0 ? (
                    <Line data={lineChartData} options={chartOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-white/30 text-sm">No data available</div>
                  )}
                </div>
              </GlassCard>

              {/* Bar: District distribution */}
              <GlassCard className="p-6">
                <h3 className="text-sm font-bold text-white mb-4">District Distribution</h3>
                <div className="h-64">
                  {Object.keys(districtData).length > 0 ? (
                    <Bar data={barChartData} options={chartOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-white/30 text-sm">No data available</div>
                  )}
                </div>
              </GlassCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Doughnut: Gender ratio */}
              <GlassCard className="p-6">
                <h3 className="text-sm font-bold text-white mb-4">Gender Ratio</h3>
                <div className="h-60 relative flex items-center justify-center">
                  {metrics.totalMembers > 0 ? (
                    <Doughnut data={doughnutChartData} options={donutOptions} />
                  ) : (
                    <div className="text-white/30 text-sm">No data available</div>
                  )}
                </div>
              </GlassCard>

              {/* Pie: Category distribution */}
              <GlassCard className="p-6">
                <h3 className="text-sm font-bold text-white mb-4">Category Distribution</h3>
                <div className="h-60 relative flex items-center justify-center">
                  {Object.keys(categoryData).length > 0 ? (
                    <Pie data={pieChartData} options={donutOptions} />
                  ) : (
                    <div className="text-white/30 text-sm">No data available</div>
                  )}
                </div>
              </GlassCard>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
