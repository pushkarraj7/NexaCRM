import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);

  const [editingDispatch, setEditingDispatch] = useState(null); // { orderId, itemIndex }
  const [dispatchValues, setDispatchValues] = useState({}); // Store temp dispatch quantities


  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const closeDropdown = () => setFilterOpen(false);
    if (filterOpen) document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [filterOpen]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const result = await response.json();
      console.log('Orders fetched:', result);

      // Handle wrapped response { success: true, data: [...] }
      const ordersData = result.success ? result.data : result;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to load orders: ' + error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };


  const handleDispatchUpdate = async (orderId, itemIndex, newDispatchQty) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/dispatch`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          itemUpdates: [{ itemIndex, dispatchQuantity: newDispatchQty }]
        })
      });

      if (response.ok) {
        alert('Dispatch quantity updated successfully!');
        fetchOrders();
        setEditingDispatch(null);
        setDispatchValues({});
      } else {
        alert('Failed to update dispatch quantity');
      }
    } catch (error) {
      console.error('Error updating dispatch quantity:', error);
      alert('Failed to update dispatch quantity');
    }
  };

  const startEditingDispatch = (orderId, itemIndex, currentDispatch) => {
    setEditingDispatch({ orderId, itemIndex });
    setDispatchValues({ [`${orderId}-${itemIndex}`]: currentDispatch });
  };

  const cancelEditingDispatch = () => {
    setEditingDispatch(null);
    setDispatchValues({});
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert('Order status updated successfully!');
        fetchOrders();
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  const toggleOrderExpand = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getCustomerName = (customer) => {
    if (typeof customer === 'object' && customer !== null) {
      return customer.name || "Unknown";
    }
    return customer || "Unknown";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const customerName = getCustomerName(order.customerId).toLowerCase();
    const orderNumber = (order.orderNumber || '').toLowerCase();
    const itemNames = order.items?.map(item => item.itemName?.toLowerCase() || '').join(' ');

    const matchesSearch =
      customerName.includes(searchTerm.toLowerCase()) ||
      orderNumber.includes(searchTerm.toLowerCase()) ||
      itemNames.includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';

      case 'pending':
        return 'bg-amber-100 text-amber-700';

      case 'processing':
        return 'bg-blue-100 text-blue-700';

      case 'shipped':
        return 'bg-indigo-100 text-indigo-700';

      case 'delivered':
        return 'bg-green-100 text-green-700';

      case 'cancelled':
        return 'bg-red-100 text-red-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Topbar />
        <div className="flex min-h-screen">
          <Sidebar className="h-full" />
          <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
            <div className="text-xl text-gray-600">Loading orders...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="flex min-h-screen">
        <Sidebar className="h-full" />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600 mt-1">Track and manage all customer orders</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

            {/* Total Orders */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
              <div className="absolute inset-y-0 left-0 w-1 bg-blue-600" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <h3 className="mt-2 text-3xl font-bold text-gray-900">
                    {orders.length}
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
              <div className="absolute inset-y-0 left-0 w-1 bg-amber-500" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                  <h3 className="mt-2 text-3xl font-bold text-gray-900">
                    {orders.filter(o => o.status === "pending").length}
                  </h3>
                  <span className="mt-1 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    In progress
                  </span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Completed Orders */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
              <div className="absolute inset-y-0 left-0 w-1 bg-emerald-600" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed Orders</p>
                  <h3 className="mt-2 text-3xl font-bold text-gray-900">
                    {orders.filter(o => o.status === "completed").length}
                  </h3>
                  <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    Delivered
                  </span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-900 bg-black p-6 text-white shadow-lg transition hover:shadow-xl">
              <div className="absolute inset-y-0 left-0 w-1 bg-white/80" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                  <h3 className="mt-2 text-3xl font-bold tracking-tight">
                    {formatCurrency(
                      orders.reduce(
                        (sum, order) => sum + parseFloat(order.totalAmount || 0),
                        0
                      )
                    )}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Lifetime earnings
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* Main Table Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Search and Filter Bar */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="relative flex-1 max-w-md w-full">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by customer, item, or order number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                  />
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                  {/* Filter Dropdown */}
                  <div className="relative w-full lg:w-48" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setFilterOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                    >
                      <span className="text-sm truncate">
                        {filterStatus === "all" ? "All Status" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2 ${filterOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {filterOpen && (
                      <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        {['all', 'pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setFilterStatus(status);
                              setFilterOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition ${filterStatus === status
                              ? "bg-gray-900 text-white font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                              }`}
                          >
                            {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-300"
                    title="Refresh"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">No orders found</p>
                            <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const orderId = order._id || order.id;
                      const isExpanded = expandedOrders.has(orderId);
                      const itemCount = order.items?.length || 0;

                      return (
                        <>
                          <tr key={orderId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleOrderExpand(orderId)}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title={isExpanded ? "Collapse" : "Expand items"}
                                >
                                  <svg
                                    className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {order.orderNumber}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    #{orderId.slice(-6).toUpperCase()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                  {getCustomerName(order.customerId).charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {getCustomerName(order.customerId)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {order.customerId?.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {order.items?.slice(0, 2).map((item, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                                    {item.itemName} × {item.quantity}
                                  </span>
                                ))}
                                {itemCount > 2 && (
                                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                    +{itemCount - 2} more
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-900">
                                {formatCurrency(order.totalAmount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-sm">
                              {formatDate(order.orderDate || order.createdAt)}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                              >
                                {order.status
                                  ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                  : ""}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-center">
                              <div
                                className="relative inline-block w-36"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenStatusDropdown(
                                      openStatusDropdown === order._id ? null : order._id
                                    )
                                  }
                                  className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
                                >
                                  <span className="capitalize">{order.status}</span>

                                  <svg
                                    className={`w-4 h-4 text-gray-500 transition-transform ${openStatusDropdown === order._id ? "rotate-180" : ""
                                      }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>

                                {/* Dropdown */}
                                {openStatusDropdown === order._id && (
                                  <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    {["pending", "processing", "shipped", "delivered", "completed", "cancelled"].map((status) => (
                                      <button
                                        key={status}
                                        onClick={() => {
                                          handleStatusChange(order._id, status);
                                          setOpenStatusDropdown(null);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-xs capitalize transition
              ${order.status === status
                                            ? "bg-gray-900 text-white font-medium"
                                            : "text-gray-700 hover:bg-gray-50"
                                          }`}
                                      >
                                        {status}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>

                          </tr>
                          {/* Expanded Items Row */}
                          {isExpanded && (
                            <tr key={`${orderId}-expanded`} className="bg-gray-50">
                              <td colSpan="7" className="px-6 py-4">
                                <div className="ml-12">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Items:</h4>
                                  <div className="space-y-2">
                                    {order.items?.map((item, idx) => {
                                      const isEditingThis = editingDispatch?.orderId === orderId && editingDispatch?.itemIndex === idx;
                                      const dispatchKey = `${orderId}-${idx}`;
                                      const currentDispatch = item.dispatchQuantity ?? item.quantity;

                                      return (
                                        <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded flex items-center justify-center">
                                              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                              </svg>
                                            </div>
                                            <div>
                                              <div className="font-medium text-gray-900">{item.itemName}</div>
                                              <div className="text-xs text-gray-500">Code: {item.itemId?.itemCode}</div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-6 text-sm">
                                            <div className="text-right">
                                              <div className="text-gray-500">Price</div>
                                              <div className="font-medium">{formatCurrency(item.price)}</div>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-gray-500">Ordered Qty</div>
                                              <div className="font-medium">{item.quantity}</div>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-gray-500">Dispatch Qty</div>
                                              {isEditingThis ? (
                                                <div className="flex items-center gap-1">
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    max={item.quantity}
                                                    value={dispatchValues[dispatchKey] ?? currentDispatch}
                                                    onChange={(e) => setDispatchValues({
                                                      ...dispatchValues,
                                                      [dispatchKey]: parseInt(e.target.value) || 0
                                                    })}
                                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:border-indigo-500"
                                                    autoFocus
                                                  />
                                                  <button
                                                    onClick={() => handleDispatchUpdate(orderId, idx, dispatchValues[dispatchKey])}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                    title="Save"
                                                  >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                  </button>
                                                  <button
                                                    onClick={cancelEditingDispatch}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    title="Cancel"
                                                  >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                  </button>
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-2">
                                                  <span className={`font-medium ${currentDispatch !== item.quantity ? 'text-orange-600' : ''}`}>
                                                    {currentDispatch}
                                                  </span>
                                                  <button
                                                    onClick={() => startEditingDispatch(orderId, idx, currentDispatch)}
                                                    className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                                    title="Edit dispatch quantity"
                                                  >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                            <div className="text-right">
                                              <div className="text-gray-500">Discount</div>
                                              <div className="font-medium text-green-600">{item.discount}%</div>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-gray-500">Subtotal</div>
                                              <div className="font-bold text-gray-900">{formatCurrency(item.subtotal)}</div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {order.notes && (
                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                      <div className="text-xs font-semibold text-yellow-800 mb-1">Notes:</div>
                                      <div className="text-sm text-yellow-700">{order.notes}</div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredOrders.length}</span> of <span className="font-semibold">{orders.length}</span> orders
                </p>
                <div className="text-sm text-gray-600">
                  Total Revenue: <span className="font-bold text-gray-900">
                    {formatCurrency(filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Orders;