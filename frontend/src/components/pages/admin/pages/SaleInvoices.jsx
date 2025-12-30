// pages/SaleInvoices.jsx
import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

const SaleInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedInvoices, setExpandedInvoices] = useState(new Set());
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentData, setPaymentData] = useState({
    paidAmount: 0,
    paymentMethod: ""
  });

  useEffect(() => {
    fetchInvoices();
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

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoices', {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch invoices');

      const result = await response.json();
      setInvoices(result.success ? result.data : result);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      alert('Failed to load invoices: ' + error.message);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!paymentModal) return;

    try {
      const response = await fetch(`/api/invoices/${paymentModal}/payment`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        alert('Payment updated successfully!');
        setPaymentModal(null);
        setPaymentData({ paidAmount: 0, paymentMethod: "" });
        fetchInvoices();
      } else {
        alert('Failed to update payment');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment');
    }
  };

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedInvoices);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedInvoices(newExpanded);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const getCustomerName = (customer) => {
    if (typeof customer === 'object' && customer !== null) {
      return customer.name || "Unknown";
    }
    return customer || "Unknown";
  };

  const filteredInvoices = invoices.filter(invoice => {
    const customerName = getCustomerName(invoice.customerId).toLowerCase();
    const invoiceNumber = (invoice.invoiceNumber || '').toLowerCase();
    
    const matchesSearch =
      customerName.includes(searchTerm.toLowerCase()) ||
      invoiceNumber.includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "all" || invoice.paymentStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700';
      case 'unpaid':
        return 'bg-red-100 text-red-700';
      case 'partial':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Topbar />
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
            <div className="text-xl text-gray-600">Loading invoices...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sale Invoices</h1>
              <p className="text-gray-600 mt-1">Manage payment status and invoice records</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="absolute inset-y-0 left-0 w-1 bg-blue-600" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                  <h3 className="mt-2 text-3xl font-bold text-gray-900">{invoices.length}</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="absolute inset-y-0 left-0 w-1 bg-emerald-600" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Paid</p>
                  <h3 className="mt-2 text-3xl font-bold text-gray-900">
                    {invoices.filter(i => i.paymentStatus === "paid").length}
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="absolute inset-y-0 left-0 w-1 bg-red-600" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Paid</p>
                  <h3 className="mt-2 text-3xl font-bold text-gray-900">
                    {invoices.filter(i => i.paymentStatus === "paid").length}
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-gray-900 bg-black p-6 text-white shadow-lg">
              <div className="absolute inset-y-0 left-0 w-1 bg-white/80" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                  <h3 className="mt-2 text-3xl font-bold">
                    {formatCurrency(invoices.reduce((sum, i) => sum + parseFloat(i.paidAmount || 0), 0))}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    of {formatCurrency(invoices.reduce((sum, i) => sum + parseFloat(i.totalAmount || 0), 0))}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Main Table Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Search and Filter */}
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
                    placeholder="Search by customer or invoice number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                  <div className="relative w-full lg:w-48" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setFilterOpen(!filterOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <span className="text-sm truncate">
                        {filterStatus === "all" ? "All Status" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                      </span>
                      <svg className={`w-4 h-4 ml-2 transition-transform ${filterOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {filterOpen && (
                      <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200">
                        {['all', 'paid', 'unpaid', 'partial'].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setFilterStatus(status);
                              setFilterOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm ${filterStatus === status ? "bg-gray-900 text-white" : "hover:bg-gray-50 text-gray-700"}`}
                          >
                            {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={fetchInvoices} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
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
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Invoice #</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Order #</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Paid</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Due Date</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-600 font-medium">No invoices found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => {
                      const isExpanded = expandedInvoices.has(invoice._id);
                      return (
                        <>
                          <tr key={invoice._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleExpand(invoice._id)}
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  <svg className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                                <div className="font-semibold text-gray-900">{invoice.invoiceNumber}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-semibold">
                                  {getCustomerName(invoice.customerId).charAt(0)}
                                </div>
                                <div className="font-medium text-gray-900">{getCustomerName(invoice.customerId)}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{invoice.orderId?.orderNumber || 'N/A'}</td>
                            <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(invoice.totalAmount)}</td>
                            <td className="px-6 py-4 font-semibold text-emerald-600">{formatCurrency(invoice.paidAmount)}</td>
                            <td className="px-6 py-4 text-gray-600 text-sm">{invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                                {invoice.paymentStatus.charAt(0).toUpperCase() + invoice.paymentStatus.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 justify-center">
                                {invoice.paymentStatus !== 'paid' && (
                                  <button
                                    onClick={() => {
                                      setPaymentModal(invoice._id);
                                      setPaymentData({
                                        paidAmount: invoice.paidAmount || 0,
                                        paymentMethod: invoice.paymentMethod || ""
                                      });
                                    }}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                                  >
                                    Update Payment
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-gray-50">
                              <td colSpan="8" className="px-6 py-4">
                                <div className="ml-12 space-y-2">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Items:</h4>
                                  {invoice.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between bg-white rounded-lg p-3 border">
                                      <div className="font-medium">{item.itemName}</div>
                                      <div className="flex gap-6 text-sm">
                                        <span>Qty: {item.quantity}</span>
                                        <span>Price: {formatCurrency(item.price)}</span>
                                        <span className="font-bold">Subtotal: {formatCurrency(item.subtotal)}</span>
                                      </div>
                                    </div>
                                  ))}
                                  {invoice.notes && (
                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                      <div className="text-xs font-semibold text-yellow-800 mb-1">Notes:</div>
                                      <div className="text-sm text-yellow-700">{invoice.notes}</div>
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
          </div>
        </main>
      </div>

      {/* Payment Update Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Update Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount (₹)</label>
                <input
                  type="number"
                  value={paymentData.paidAmount}
                  onChange={(e) => setPaymentData({...paymentData, paidAmount: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdatePayment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
              <button
                onClick={() => setPaymentModal(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleInvoices;