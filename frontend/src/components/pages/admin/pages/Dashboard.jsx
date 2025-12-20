import { useState } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

const AdminDashboard = () => {
  const handleNavigate = (path) => {
    alert(`Navigating to: ${path}`);
  };

  const dashboardCards = [
    {
      title: "Manage Customers",
      path: "/admin/customers",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      description: "Add, edit, and manage customer profiles",
      color: "bg-blue-600",
      hoverColor: "group-hover:bg-blue-50",
      count: "1,245"
    },
    {
      title: "Manage Items",
      path: "/admin/items",
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
      description: "Update inventory and item details",
      color: "bg-indigo-600",
      hoverColor: "group-hover:bg-indigo-50",
      count: "856"
    },
    {
      title: "Approve Agreements",
      path: "/admin/agreements",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      description: "Review and approve rental agreements",
      color: "bg-emerald-600",
      hoverColor: "group-hover:bg-emerald-50",
      count: "23"
    },
    {
      title: "Order Dispatch",
      path: "/admin/orders",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      description: "Manage order fulfillment and shipping",
      color: "bg-amber-600",
      hoverColor: "group-hover:bg-amber-50",
      count: "48"
    },
  ];

  const stats = [
    { label: "Total Revenue", value: "₹2,45,890", change: "+12.5%", isPositive: true, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Active Orders", value: "48", change: "+8", isPositive: true, icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", color: "bg-indigo-50", iconColor: "text-indigo-600" },
    { label: "Total Customers", value: "1,245", change: "+23", isPositive: true, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", color: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Pending Approvals", value: "23", change: "-5", isPositive: false, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-amber-50", iconColor: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="flex min-h-screen">
        <Sidebar className="h-full" />
        
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, Admin! 👋
              </h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your business today.</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <svg className={`w-6 h-6 ${stat.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                    </svg>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stat.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardCards.map((card, index) => (
              <div
                key={index}
                onClick={() => handleNavigate(card.path)}
                className="group relative bg-white rounded-xl p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Background on hover */}
                <div className={`absolute inset-0 ${card.hoverColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} />
                    </svg>
                  </div>

                  {/* Count Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold text-white ${card.color} rounded-full`}>
                      {card.count}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4">
                    {card.description}
                  </p>

                  {/* Arrow Icon */}
                  <div className="flex items-center text-gray-900 font-medium text-sm group-hover:gap-2 transition-all">
                    <span>View Details</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity Section */}
          <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: "New customer registered", user: "John Doe", time: "5 minutes ago", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z", color: "bg-blue-600" },
                { action: "Agreement approved", user: "Jane Smith", time: "15 minutes ago", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-emerald-600" },
                { action: "Order dispatched", user: "Order #1234", time: "1 hour ago", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", color: "bg-indigo-600" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={activity.icon} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;