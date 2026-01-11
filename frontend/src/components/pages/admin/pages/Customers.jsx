import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import { API_ENDPOINTS } from '../../../../config/api'; // ✅ ADDED THIS

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNavigate = (path) => {
    alert(`Navigating to: ${path}`);
  };

  const [newCustomer, setNewCustomer] = useState({
    customerId: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "active",
  });

  const [customers, setCustomers] = useState([]);

  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [editCustomer, setEditCustomer] = useState({
    customerId: "",
    name: "",
    email: "",
    phone: "",
    status: "active",
  });

  // Fetch customers from backend
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.CUSTOMERS, { // ✅ CHANGED
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Handle customer creation
  const handleCreateCustomer = async () => {
    setError("");
    setLoading(true);

    // Validation
    if (!newCustomer.customerId || !newCustomer.name || !newCustomer.email || !newCustomer.phone || !newCustomer.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(API_ENDPOINTS.REGISTER_CUSTOMER, { // ✅ CHANGED
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: newCustomer.customerId,
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          password: newCustomer.password,
          status: newCustomer.status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCustomers([...customers, {
          _id: data._id,
          customerId: data.customerId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          status: data.status,
          orders: data.orders,
          createdAt: data.createdAt,
        }]);

        setShowModal(false);
        setNewCustomer({ customerId: "", name: "", email: "", phone: "", password: "", status: "active" });
        setError("");

        alert("Customer created successfully!");
      } else {
        setError(data.message || 'Failed to create customer');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Error creating customer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle view customer
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setViewModal(true);
  };

  // Handle edit customer
  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setEditCustomer({
      customerId: customer.customerId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
    });
    setEditModal(true);
  };

  // Handle update customer
  const handleUpdateCustomer = async () => {
    setError("");
    setLoading(true);

    if (!editCustomer.customerId || !editCustomer.name || !editCustomer.email || !editCustomer.phone) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.CUSTOMERS}/${selectedCustomer._id}`, { // ✅ CHANGED
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editCustomer),
      });

      const data = await response.json();

      if (response.ok) {
        setCustomers(customers.map(c =>
          c._id === selectedCustomer._id ? { ...c, ...editCustomer } : c
        ));

        setEditModal(false);
        setSelectedCustomer(null);
        setError("");
        alert("Customer updated successfully!");
      } else {
        setError(data.message || 'Failed to update customer');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Error updating customer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = (customer) => {
    setSelectedCustomer(customer);
    setDeleteModal(true);
  };

  // Confirm delete customer
  const confirmDeleteCustomer = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.CUSTOMERS}/${selectedCustomer._id}`, { // ✅ CHANGED
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCustomers(customers.filter(c => c._id !== selectedCustomer._id));
        setDeleteModal(false);
        setSelectedCustomer(null);
        alert("Customer deleted successfully!");
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete customer');
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
      console.error('Error deleting customer:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const closeDropdown = () => setFilterOpen(false);
    if (filterOpen) document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [filterOpen]);

  useEffect(() => {
    const handleClickOutside = () => setStatusOpen(false);
    if (statusOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [statusOpen]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || customer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: "Total Customers", value: customers.length.toString(), icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", color: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Active", value: customers.filter(c => c.status === "active").length.toString(), icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Inactive", value: customers.filter(c => c.status === "inactive").length.toString(), icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-amber-50", iconColor: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="flex min-h-screen">
        <Sidebar className="h-full" />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Customer Management
              </h1>
              <p className="text-gray-600 mt-1">Manage and organize your customer database</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <svg className={`w-6 h-6 ${stat.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                  />
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                  <div className="relative w-full lg:w-48" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setFilterOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                    >
                      <span className="capitalize text-sm">
                        {filterStatus === "all" ? "All Status" : filterStatus}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${filterOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {filterOpen && (
                      <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        {[
                          { label: "All Status", value: "all" },
                          { label: "Active", value: "active" },
                          { label: "Inactive", value: "inactive" },
                        ].map((item) => (
                          <button
                            key={item.value}
                            onClick={() => {
                              setFilterStatus(item.value);
                              setFilterOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition ${filterStatus === item.value
                              ? "bg-gray-900 text-white font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                              }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-300 whitespace-nowrap"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Customer
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">No customers found</p>
                            <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                              {customer.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{customer.name}</p>
                              <p className="text-sm text-gray-500">ID: {customer.customerId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-700 flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {customer.email}
                            </p>
                            <p className="text-sm text-gray-700 flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {customer.phone}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${customer.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${customer.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                            {customer.status?.charAt(0).toUpperCase() + customer.status?.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span className="font-medium text-gray-900">{customer.orders || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(customer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewCustomer(customer)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEditCustomer(customer)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit Customer"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Customer"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredCustomers.length}</span> of <span className="font-semibold">{customers.length}</span> customers
                </p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all">
                    1
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                    2
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add Customer Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setShowModal(false)}
              /><div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-xl border border-gray-200 transform transition-all duration-300 scale-100">
                <div className="px-8 pt-8 pb-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Add New Customer
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter customer details to create a new account
                  </p>
                </div>

                <div className="px-8 py-6 space-y-5">
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-red-800">{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700">Customer ID</label>
                    <input
                      type="text"
                      value={newCustomer.customerId}
                      onChange={(e) => setNewCustomer({ ...newCustomer, customerId: e.target.value })}
                      className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none transition"
                      placeholder="CUST001"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Customer Name</label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none transition"
                      placeholder="ABC Dairy"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none transition"
                      placeholder="customer@email.com"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none transition"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      value={newCustomer.password}
                      onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
                      className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none transition"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <button
                      type="button"
                      onClick={() => setStatusOpen((prev) => !prev)}
                      className="mt-1 w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition"
                    >
                      <span className="text-gray-700 capitalize">
                        {newCustomer.status}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${statusOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {statusOpen && (
                      <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        {["active", "inactive"].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setNewCustomer({ ...newCustomer, status });
                              setStatusOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 capitalize transition ${newCustomer.status === status
                              ? "bg-gray-900 text-white font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                              }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setError("");
                      setNewCustomer({ customerId: "", name: "", email: "", phone: "", password: "", status: "active" });
                    }}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    disabled={loading}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCreateCustomer}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      'Create Customer'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Customer Modal */}
          {viewModal && selectedCustomer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setViewModal(false)}
              />
              <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl border border-gray-200">
                <div className="px-8 pt-8 pb-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
                </div>

                <div className="px-8 py-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* Customer ID */}
                    <div className="border rounded-xl p-4 bg-white shadow-sm">
                      <p className="text-sm text-gray-500">Customer ID</p>
                      <p className="text-base text-gray-900 mt-1">
                        {selectedCustomer.customerId}
                      </p>
                    </div>

                    {/* Customer Name */}
                    <div className="border rounded-xl p-4 bg-white shadow-sm">
                      <p className="text-sm text-gray-500">Customer Name</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedCustomer.name}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="border rounded-xl p-4 bg-white shadow-sm">
                      <p className="text-sm text-gray-500">Status</p>
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mt-2 ${selectedCustomer.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                          }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${selectedCustomer.status === "active"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                            }`}
                        />
                        {selectedCustomer.status?.charAt(0).toUpperCase() +
                          selectedCustomer.status?.slice(1)}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="border rounded-xl p-4 bg-white shadow-sm">
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="text-base text-gray-900 mt-1">
                        {selectedCustomer.email}
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="border rounded-xl p-4 bg-white shadow-sm">
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-base text-gray-900 mt-1">
                        {selectedCustomer.phone}
                      </p>
                    </div>

                    {/* Orders */}
                    <div className="border rounded-xl p-4 bg-white shadow-sm">
                      <p className="text-sm text-gray-500">Total Orders</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedCustomer.orders || 0}
                      </p>
                    </div>

                    {/* Customer ID */}
                    <div className="border rounded-xl p-4 bg-white shadow-sm">
                      <p className="text-sm text-gray-500">Customer ID</p>
                      <p className="text-base text-gray-900 mt-1">
                        #{selectedCustomer._id?.slice(-8)}
                      </p>
                    </div>

                    {/* Joined Date (Full Width) */}
                    <div className="border rounded-xl p-4 bg-white shadow-sm col-span-1 sm:col-span-2">
                      <p className="text-sm text-gray-500">Joined Date</p>
                      <p className="text-base text-gray-900 mt-1">
                        {new Date(selectedCustomer.createdAt).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                  </div>
                </div>

                <div className="flex justify-end gap-3 px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                  <button
                    onClick={() => setViewModal(false)}
                    className="px-5 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Customer Modal */}
          {editModal && selectedCustomer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setEditModal(false)}
              />
              <div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-xl border border-gray-200">
                <div className="px-8 pt-8 pb-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Customer</h2>
                  <p className="text-sm text-gray-500 mt-1">Update customer information</p>
                </div>

                <div className="px-8 py-6 space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-red-800">{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700">Customer ID</label>
                    <input
                      type="text"
                      value={editCustomer.customerId}
                      onChange={(e) => setEditCustomer({ ...editCustomer, customerId: e.target.value })}
                      className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Customer Name</label>
                    <input
                      type="text"
                      value={editCustomer.name}
                      onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                      className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      value={editCustomer.email}
                      onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
                      className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      value={editCustomer.phone}
                      onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                      className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none transition"
                    />
                  </div>

                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <button
                      type="button"
                      onClick={() => setStatusOpen((prev) => !prev)}
                      className="mt-1 w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition"
                    >
                      <span className="text-gray-700 capitalize">{editCustomer.status}</span>
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${statusOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {statusOpen && (
                      <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        {["active", "inactive"].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setEditCustomer({ ...editCustomer, status });
                              setStatusOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 capitalize transition ${editCustomer.status === status
                              ? "bg-gray-900 text-white font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                              }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setEditModal(false);
                      setError("");
                    }}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCustomer}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      'Update Customer'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Customer Modal */}
          {deleteModal && selectedCustomer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setDeleteModal(false)}
              />
              <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl border border-gray-200">
                <div className="px-8 pt-8 pb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Delete Customer</h2>
                  <p className="text-sm text-gray-500 mt-2">
                    Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedCustomer.name}</span>? This action cannot be undone.
                  </p>
                </div>

                <div className="flex justify-end gap-3 px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                  <button
                    onClick={() => setDeleteModal(false)}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteCustomer}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      'Delete Customer'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Customers;