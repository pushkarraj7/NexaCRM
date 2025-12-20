import { useState } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, ShoppingCart, Users, Activity, ArrowUp, ArrowDown } from "lucide-react";

const revenueData = [
  { month: "Jan", revenue: 120000, orders: 180 },
  { month: "Feb", revenue: 150000, orders: 220 },
  { month: "Mar", revenue: 180000, orders: 280 },
  { month: "Apr", revenue: 210000, orders: 340 },
  { month: "May", revenue: 260000, orders: 420 },
];

const orderStatusData = [
  { status: "Pending", orders: 14, fill: "#f59e0b" },
  { status: "Completed", orders: 32, fill: "#10b981" },
  { status: "Cancelled", orders: 5, fill: "#ef4444" },
];

const revenueSplit = [
  { name: "Milk", value: 45 },
  { name: "Butter", value: 25 },
  { name: "Cheese", value: 20 },
  { name: "Other", value: 10 },
];

const COLORS = ["#3b82f6", "#6366f1", "#10b981", "#f59e0b"];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("5M");

  const kpiData = [
    {
      label: "Total Revenue",
      value: "₹9.2L",
      change: "+23.4%",
      trend: "up",
      icon: TrendingUp,
      color: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Total Orders",
      value: "1,248",
      change: "+12.8%",
      trend: "up",
      icon: ShoppingCart,
      color: "bg-indigo-50",
      iconBg: "bg-indigo-100",
      textColor: "text-indigo-600",
    },
    {
      label: "Active Customers",
      value: "312",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      textColor: "text-emerald-600",
    },
    {
      label: "Growth Rate",
      value: "+18%",
      change: "+5.1%",
      trend: "up",
      icon: Activity,
      color: "bg-amber-50",
      iconBg: "bg-amber-100",
      textColor: "text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="flex min-h-screen">
        <Sidebar className="h-full" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-auto">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Real-time business insights and performance metrics</p>
            </div>

            <div className="flex gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              {["1D", "1W", "1M", "3M", "5M"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${timeRange === range
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((kpi, index) => {
              const Icon = kpi.icon;
              const TrendIcon = kpi.trend === "up" ? ArrowUp : ArrowDown;
              return (
                <div
                  key={index}
                  className={`group relative ${kpi.color} rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm font-medium">{kpi.label}</p>
                      <h2 className="text-3xl font-bold text-gray-900 mt-2">
                        {kpi.value}
                      </h2>
                      <div className="flex items-center gap-1 mt-3">
                        <TrendIcon className={`w-4 h-4 ${kpi.trend === "up" ? "text-emerald-600" : "text-red-600"}`} />
                        <span className={`text-sm font-semibold ${kpi.trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                          {kpi.change}
                        </span>
                        <span className="text-gray-500 text-xs">vs last month</span>
                      </div>
                    </div>

                    <div className={`${kpi.iconBg} p-3 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-6 h-6 ${kpi.textColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Revenue Trend</h3>
                  <p className="text-gray-500 text-sm mt-1">Monthly revenue performance over time</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">₹9.2L</p>
                  <p className="text-xs text-emerald-600 font-medium">+23.4% growth</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Revenue Split</h3>
              <p className="text-gray-500 text-sm mb-4">Distribution by product category</p>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueSplit}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                    style={{ fontSize: '12px', fontWeight: '500' }}
                  >
                    {revenueSplit.map((_, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Order Status Overview</h3>
                <p className="text-gray-500 text-sm mt-1">Current order distribution across all statuses</p>
              </div>
              <div className="text-right bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">51</p>
                <p className="text-gray-600 text-xs font-medium">Total Orders</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={orderStatusData}>
                <XAxis
                  dataKey="status"
                  stroke="#9ca3af"
                  style={{ fontSize: '14px' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
                />
                <Bar
                  dataKey="orders"
                  radius={[8, 8, 0, 0]}
                  fill="#3b82f6"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-50 p-2.5 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">+15%</span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Avg Order Value</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">₹738</h3>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-indigo-50 p-2.5 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">+3%</span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Customer Retention</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">87%</h3>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-emerald-50 p-2.5 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">+2.1%</span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Conversion Rate</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">12.4%</h3>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;