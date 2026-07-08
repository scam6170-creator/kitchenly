import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { dashboardAPI, reportsAPI } from '../api/endpoints';
import { t } from '../i18n/translations';
import { useUIStore } from '../store/ui';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const language = useUIStore((state) => state.language);
  const [summary, setSummary] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, recentSalesData, topProductsData, monthlyRevenueData] = await Promise.all([
          dashboardAPI.summary(),
          dashboardAPI.recentSales(),
          dashboardAPI.topProducts(),
          dashboardAPI.monthlyRevenue(),
        ]);

        setSummary(summaryData.data);
        setRecentSales(recentSalesData.data);
        setTopProducts(topProductsData.data);
        setMonthlyRevenue(monthlyRevenueData.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('loading', language)}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      title: t('sales_today', language),
      value: summary?.todays_sales?.count || 0,
      icon: '💳',
      color: 'bg-blue-500',
    },
    {
      title: t('revenue', language),
      value: `$${summary?.todays_sales?.total || 0}`,
      icon: '💰',
      color: 'bg-green-500',
    },
    {
      title: t('profit', language),
      value: `$${summary?.todays_profit?.profit || 0}`,
      icon: '📈',
      color: 'bg-purple-500',
    },
    {
      title: t('low_stock', language),
      value: summary?.low_stock_products?.count || 0,
      icon: '⚠️',
      color: 'bg-red-500',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('dashboard', language)}</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your business summary.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} text-white p-3 rounded-lg text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">{t('revenue', language)} Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Top Products</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_sold" fill="#10b981" name="Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Sales</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.slice(0, 5).map((sale) => (
                  <tr key={sale.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{sale.product_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{sale.quantity}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">${sale.total_amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(sale.sale_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
