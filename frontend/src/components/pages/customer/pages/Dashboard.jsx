import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";


// Main Dashboard Component
const CustomerDashboard = () => {
    const stats = [
        { label: "Total Orders", value: "24", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", color: "bg-blue-50 text-blue-600", change: "+12%" },
        { label: "Active Agreements", value: "8", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "bg-green-50 text-green-600", change: "+3" },
        { label: "Pending Orders", value: "3", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-yellow-50 text-yellow-600", change: "-2" },
        { label: "Total Spent", value: "$12,450", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-purple-50 text-purple-600", change: "+18%" },
    ];

    const recentOrders = [
        { id: "ORD-001", item: "Product A", quantity: 50, status: "Delivered", date: "Dec 20, 2025", amount: "$2,500" },
        { id: "ORD-002", item: "Product B", quantity: 30, status: "In Transit", date: "Dec 22, 2025", amount: "$1,800" },
        { id: "ORD-003", item: "Product C", quantity: 100, status: "Processing", date: "Dec 24, 2025", amount: "$5,200" },
        { id: "ORD-004", item: "Product D", quantity: 25, status: "Delivered", date: "Dec 18, 2025", amount: "$1,250" },
    ];

    const agreements = [
        { id: "AGR-001", name: "Standard Supply Agreement", items: 5, startDate: "Jan 1, 2025", endDate: "Dec 31, 2025", status: "Active" },
        { id: "AGR-002", name: "Premium Service Contract", items: 3, startDate: "Mar 15, 2025", endDate: "Mar 14, 2026", status: "Active" },
        { id: "AGR-003", name: "Bulk Purchase Agreement", items: 8, startDate: "Jun 1, 2025", endDate: "May 31, 2026", status: "Expiring Soon" },
    ];

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "delivered":
                return "bg-green-100 text-green-700";
            case "in transit":
                return "bg-blue-100 text-blue-700";
            case "processing":
                return "bg-yellow-100 text-yellow-700";
            case "active":
                return "bg-green-100 text-green-700";
            case "expiring soon":
                return "bg-orange-100 text-orange-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Topbar />

            <div className="flex min-h-screen">
                <Sidebar />

                <main className="flex-1 p-6 lg:p-8 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                            <p className="text-gray-500 mt-1">Welcome back! Here's your overview</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">{stat.change} from last month</span>
                                        </div>
                                        <div className={`${stat.color} p-3 rounded-lg`}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Orders */}
                            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                                        <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">View All</button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Item</th>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {recentOrders.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{order.id}</td>
                                                    <td className="py-4 px-6 text-sm text-gray-700">{order.item}</td>
                                                    <td className="py-4 px-6 text-sm text-gray-700">{order.quantity}</td>
                                                    <td className="py-4 px-6 text-sm text-gray-500">{order.date}</td>
                                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{order.amount}</td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Active Agreements */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Active Agreements</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    {agreements.map((agreement) => (
                                        <div key={agreement.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium text-gray-900 text-sm">{agreement.name}</h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agreement.status)}`}>
                                                    {agreement.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">{agreement.id}</p>
                                            <div className="flex items-center justify-between text-xs text-gray-600">
                                                <span>{agreement.items} items</span>
                                                <span>{agreement.endDate}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <button className="bg-gradient-to-r from-gray-800 to-black text-white p-6 rounded-xl hover:shadow-lg transition-all flex items-center gap-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <div className="text-left">
                                    <h4 className="font-semibold">New Order</h4>
                                    <p className="text-sm text-gray-300">Place a new order</p>
                                </div>
                            </button>

                            <button className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:border-gray-900 hover:shadow-lg transition-all flex items-center gap-4">
                                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <div className="text-left">
                                    <h4 className="font-semibold text-gray-900">Browse Items</h4>
                                    <p className="text-sm text-gray-500">View available products</p>
                                </div>
                            </button>

                            <button className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:border-gray-900 hover:shadow-lg transition-all flex items-center gap-4">
                                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <div className="text-left">
                                    <h4 className="font-semibold text-gray-900">Support</h4>
                                    <p className="text-sm text-gray-500">Get help and support</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CustomerDashboard;