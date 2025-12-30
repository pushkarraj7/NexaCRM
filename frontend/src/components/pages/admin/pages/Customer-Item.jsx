import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

const CustomerItem = () => {
    const [customers, setCustomers] = useState([]);
    const [items, setItems] = useState([]);
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCustomer, setFilterCustomer] = useState("all");
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingAgreement, setViewingAgreement] = useState(null);

    const [formData, setFormData] = useState({
        customerId: "",
        items: [], // Array of {itemId, price, discount}
    });

    useEffect(() => {
        fetchData();
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

    // UPDATED fetchData function with better error handling:

    const fetchData = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const [customersRes, itemsRes, agreementsRes] = await Promise.all([
                fetch("/api/auth/customers", { headers }),
                fetch("/api/items", { headers }),
                fetch("/api/agreements", { headers }),
            ]);

            // Check responses
            console.log('Customers Response:', customersRes.status);
            console.log('Items Response:', itemsRes.status);
            console.log('Agreements Response:', agreementsRes.status);

            if (!customersRes.ok || !itemsRes.ok || !agreementsRes.ok) {
                throw new Error("API request failed");
            }

            const customersData = await customersRes.json();
            const itemsData = await itemsRes.json();
            const agreementsData = await agreementsRes.json();

            // Debug: Log the actual data
            console.log('Customers Data:', customersData);
            console.log('Items Data:', itemsData);
            console.log('Agreements Data:', agreementsData);

            // ✅ Ensure data is always an array
            setCustomers(Array.isArray(customersData) ? customersData : []);
            setItems(Array.isArray(itemsData) ? itemsData : []);
            setAgreements(Array.isArray(agreementsData) ? agreementsData : []);

        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Failed to load data: " + error.message);

            // Set empty arrays on error
            setCustomers([]);
            setItems([]);
            setAgreements([]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSubmit = async () => {
        if (!formData.customerId || formData.items.length === 0) {
            alert("Please select customer and at least one item");
            return;
        }

        try {
            const url = editingId
                ? `/api/agreements/${editingId}`
                : "/api/agreements";


            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message || "Agreements created successfully!");
                setShowModal(false);
                resetForm();
                fetchData();
            } else {
                const error = await response.json();
                alert(error.message || "Failed to save agreement");
            }
        } catch (error) {
            console.error("Error saving agreement:", error);
            alert("Failed to save agreement");
        }
    };

    const handleEdit = (agreement) => {
        const agreementId = agreement._id || agreement.id;
        const customerId = agreement.customerId?._id || agreement.customerId;

        setEditingId(agreementId);
        setFormData({
            customerId: customerId,
            items: agreement.items?.map(item => ({
                itemId: item.itemId?._id || item.itemId,
                price: item.price,
                discount: item.discount || 0
            })) || []
        });
        setShowModal(true);
    };

    const handleView = (agreement) => {
        setViewingAgreement(agreement);
        setShowViewModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this agreement?")) return;

        try {
            const response = await fetch(`/api/agreements/${id}`, {  // ✅ Changed from /api/auth/customer-items
                method: "DELETE",
                headers: getAuthHeaders()
            });

            if (response.ok) {
                alert("Agreement deleted successfully!");
                fetchData();
            } else {
                alert("Failed to delete agreement");
            }
        } catch (error) {
            console.error("Error deleting agreement:", error);
            alert("Failed to delete agreement");
        }
    };

    const resetForm = () => {
        setFormData({
            customerId: "",
            items: [],
        });
        setEditingId(null);
    };

    const getCustomerName = (id) => {
        if (typeof id === 'object' && id !== null) {
            return id.name || "Unknown";
        }
        const customer = customers.find(c => (c._id || c.id) === id);
        return customer ? customer.name : "Unknown";
    };

    const getItemName = (id) => {
        if (typeof id === 'object' && id !== null) {
            return id.name || "Unknown";
        }
        const item = items.find(i => (i._id || i.id) === id);
        return item ? item.name : "Unknown";
    };

    const calculateFinalPrice = (price, discount) => {
        const discountAmount = (parseFloat(price) * parseFloat(discount)) / 100;
        return (parseFloat(price) - discountAmount).toFixed(2);
    };

    // Filter agreements
    const filteredAgreements = agreements.filter(agreement => {
        const customerName = getCustomerName(agreement.customerId).toLowerCase();
        const matchesSearch = customerName.includes(searchTerm.toLowerCase()) ||
            agreement.items?.some(item =>
                getItemName(item.itemId).toLowerCase().includes(searchTerm.toLowerCase())
            );

        const matchesFilter = filterCustomer === "all" ||
            getCustomerName(agreement.customerId) === filterCustomer;

        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Topbar />
                <div className="flex min-h-screen">
                    <Sidebar className="h-full" />
                    <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
                        <div className="text-xl text-gray-600">Loading...</div>
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
                            <h1 className="text-3xl font-bold text-gray-900">
                                Customer-Item Agreements
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Map items to customers with custom pricing and discounts
                            </p>
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
                                        placeholder="Search by customer or item..."
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
                                                {filterCustomer === "all" ? "All Customers" : filterCustomer}
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
                                            <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
                                                <button
                                                    onClick={() => {
                                                        setFilterCustomer("all");
                                                        setFilterOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm transition ${filterCustomer === "all"
                                                        ? "bg-gray-900 text-white font-medium"
                                                        : "hover:bg-gray-50 text-gray-700"
                                                        }`}
                                                >
                                                    All Customers
                                                </button>
                                                {[...new Set(agreements.map(a => getCustomerName(a.customerId)))].map((customerName) => (
                                                    <button
                                                        key={customerName}
                                                        onClick={() => {
                                                            setFilterCustomer(customerName);
                                                            setFilterOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 text-sm transition ${filterCustomer === customerName
                                                            ? "bg-gray-900 text-white font-medium"
                                                            : "hover:bg-gray-50 text-gray-700"
                                                            }`}
                                                    >
                                                        {customerName}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Add Agreement Button */}
                                    <button
                                        onClick={() => {
                                            resetForm();
                                            setShowModal(true);
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-300 whitespace-nowrap"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Agreement
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Item
                                        </th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Base Price
                                        </th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Discount
                                        </th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Final Price
                                        </th>
                                        <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredAgreements.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600 font-medium">No agreements found</p>
                                                        <p className="text-sm text-gray-400">Try adjusting your search or create a new agreement</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAgreements.map((agreement) => {
                                            const agreementId = agreement._id || agreement.id;
                                            const totalItems = agreement.items?.length || 0;
                                            const totalValue = agreement.items?.reduce((sum, item) =>
                                                sum + parseFloat(calculateFinalPrice(item.price, item.discount || 0)), 0
                                            ) || 0;

                                            return (
                                                <tr key={agreementId} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                                                {getCustomerName(agreement.customerId).charAt(0)}
                                                            </div>
                                                            <div className="font-medium text-gray-900">
                                                                {getCustomerName(agreement.customerId)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {agreement.items?.slice(0, 3).map((item, idx) => (
                                                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                                                                    {getItemName(item.itemId)}
                                                                </span>
                                                            ))}
                                                            {totalItems > 3 && (
                                                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                                    +{totalItems - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-600">
                                                            {totalItems} item{totalItems !== 1 ? 's' : ''}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-600">
                                                            {agreement.items?.some(i => i.discount > 0) ? 'Varies' : '0%'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-emerald-600">
                                                            ₹{totalValue.toFixed(2)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleView(agreement)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="View Agreement"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(agreement)}
                                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                                title="Edit Agreement"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(agreementId)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete Agreement"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
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
                                    Showing <span className="font-semibold">{filteredAgreements.length}</span> of <span className="font-semibold">{agreements.length}</span> agreements
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* View Agreement Modal */}
            {showViewModal && viewingAgreement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowViewModal(false)}
                    />
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Customer Agreement</h2>
                                <p className="text-sm text-gray-500 mt-1">View pricing details and terms</p>
                            </div>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* PDF-like Content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg border border-gray-200 p-10">
                                {/* Agreement Header */}
                                <div className="text-center border-b-2 border-gray-900 pb-6 mb-8">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">PRICING AGREEMENT</h1>
                                    <p className="text-sm text-gray-600">Customer-Item Price & Discount Terms</p>
                                </div>

                                {/* Agreement Details */}
                                <div className="space-y-6 mb-8">
                                    {/* Customer Info */}
                                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Customer Information</h3>
                                        <div className="flex justify-between items-center gap-4">
                                            {/* Left: Avatar + Name */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                                    {getCustomerName(viewingAgreement.customerId).charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-xl font-bold text-gray-900">
                                                        {getCustomerName(viewingAgreement.customerId)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Agreement ID: {(viewingAgreement._id || viewingAgreement.id).slice(-8).toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right: Email & Phone */}
                                            <div className="bg-white shadow rounded-lg border border-gray-200 p-4 w-56 space-y-2">
                                                <p className="text-sm text-gray-500 font-semibold">
                                                    Email: <span className="text-gray-900 font-medium">{viewingAgreement.customerId.email}</span>
                                                </p>
                                                <p className="text-sm text-gray-500 font-semibold">
                                                    Phone: <span className="text-gray-900 font-medium">{viewingAgreement.customerId.phone}</span>
                                                </p>
                                            </div>

                                        </div>

                                    </div>

                                    {/* Date Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                            <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Created On</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(viewingAgreement.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                                            <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">Last Updated</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(viewingAgreement.updatedAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        Items & Pricing Details
                                    </h3>

                                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-900 text-white">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">#</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Item Name</th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Base Price</th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Discount</th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Final Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {viewingAgreement.items?.map((item, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-600 font-medium">{index + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center">
                                                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                    </svg>
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {getItemName(item.itemId)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                            ₹{parseFloat(item.price).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${item.discount > 0
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {item.discount || 0}%
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">
                                                            ₹{calculateFinalPrice(item.price, item.discount || 0)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-50">
                                                <tr>
                                                    <td colSpan="4" className="px-4 py-4 text-right text-sm font-bold text-gray-900">
                                                        Total Agreement Value:
                                                    </td>
                                                    <td className="px-4 py-4 text-right text-lg font-bold text-emerald-600">
                                                        ₹{viewingAgreement.items?.reduce((sum, item) =>
                                                            sum + parseFloat(calculateFinalPrice(item.price, item.discount || 0)), 0
                                                        ).toFixed(2)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                {/* Summary Section */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 mb-8">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4">Agreement Summary</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">
                                                {viewingAgreement.items?.length || 0}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">Total Items</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-emerald-600">
                                                {viewingAgreement.items?.filter(i => i.discount > 0).length || 0}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">Discounted Items</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-amber-600">
                                                ₹{(viewingAgreement.items?.reduce((sum, item) =>
                                                    sum + (parseFloat(item.price) * parseFloat(item.discount || 0) / 100), 0
                                                ) || 0).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">Total Savings</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms & Conditions */}
                                <div className="border-t-2 border-gray-200 pt-6">
                                    <h3 className="text-sm font-bold text-gray-900 mb-3">Terms & Conditions</h3>
                                    <ul className="text-xs text-gray-600 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-gray-400 mt-0.5">•</span>
                                            <span>All prices are in Indian Rupees (₹) and are subject to applicable taxes.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-gray-400 mt-0.5">•</span>
                                            <span>Discounts mentioned are exclusive to this agreement and cannot be combined with other offers.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-gray-400 mt-0.5">•</span>
                                            <span>Prices and discounts are valid until modified by mutual agreement.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-gray-400 mt-0.5">•</span>
                                            <span>This agreement is subject to the general terms and conditions of sale.</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Footer */}
                                <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                                    <p>This is a digitally generated agreement document.</p>
                                    <p className="mt-1">Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between px-8 py-4 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    handleEdit(viewingAgreement);
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Agreement
                            </button>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => {
                            setShowModal(false);
                            resetForm();
                        }}
                    />
                    {/* Modal */}
                    <div className="relative w-full max-w-3xl h-[80vh] mx-4 bg-white rounded-xl shadow-xl border border-gray-200 transform transition-all duration-300 flex flex-col">
                        {/* Header */}
                        <div className="px-8 pt-8 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingId ? "Edit Agreement" : "Add New Agreement"}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {editingId
                                    ? "Update the agreement details"
                                    : "Create a new customer-item pricing agreement"}
                            </p>
                        </div>

                        {/* Modal Body with scroll */}
                        <div className="px-8 py-6 overflow-y-auto flex-1 space-y-5">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Customer *</label>
                                <select
                                    value={formData.customerId}
                                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none transition"
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map(customer => {
                                        const customerId = customer._id || customer.id;
                                        return (
                                            <option key={customerId} value={customerId}>
                                                {customer.name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Items *</label>
                                <div className="mt-1 w-full max-h-[400px] overflow-y-auto rounded-lg border border-gray-300 bg-white">
                                    {items.map(item => {
                                        const itemId = item._id || item.id;
                                        const selectedItem = formData.items.find(i => i.itemId === itemId);
                                        const isSelected = !!selectedItem;

                                        return (
                                            <div
                                                key={itemId}
                                                className="border-b border-gray-100 last:border-b-0"
                                            >
                                                <label className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormData({
                                                                    ...formData,
                                                                    items: [...formData.items, {
                                                                        itemId: itemId,
                                                                        price: item.mrp,
                                                                        discount: 0
                                                                    }]
                                                                });
                                                            } else {
                                                                setFormData({
                                                                    ...formData,
                                                                    items: formData.items.filter(i => i.itemId !== itemId)
                                                                });
                                                            }
                                                        }}
                                                        className="w-4 h-4 mt-1 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                                            <span className="text-sm font-semibold text-gray-700">₹{item.mrp}</span>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="mt-3 space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <label className="text-xs text-gray-600 w-20">Price:</label>
                                                                    <input
                                                                        type="text"
                                                                        value={`₹${selectedItem.price}`}
                                                                        disabled
                                                                        className="flex-1 px-3 py-1.5 text-sm rounded border border-gray-200 bg-gray-50 text-gray-500"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <label className="text-xs text-gray-600 w-20">Discount %:</label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        step="0.01"
                                                                        value={selectedItem.discount}
                                                                        onChange={(e) => {
                                                                            const updatedItems = formData.items.map(i =>
                                                                                i.itemId === itemId
                                                                                    ? { ...i, discount: e.target.value }
                                                                                    : i
                                                                            );
                                                                            setFormData({ ...formData, items: updatedItems });
                                                                        }}
                                                                        className="flex-1 px-3 py-1.5 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <label className="text-xs text-gray-600 w-20">Final:</label>
                                                                    <span className="flex-1 px-3 py-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded border border-emerald-200">
                                                                        ₹{calculateFinalPrice(selectedItem.price, selectedItem.discount)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.items.length} item(s) selected
                                </p>
                            </div>

                            {formData.items.length > 0 && (
                                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Summary:</div>
                                    <div className="space-y-1">
                                        {formData.items.map(item => {
                                            const itemData = items.find(i => (i._id || i.id) === item.itemId);
                                            return (
                                                <div key={item.itemId} className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">{itemData?.name}</span>
                                                    <span className="font-semibold text-emerald-600">
                                                        ₹{calculateFinalPrice(item.price, item.discount)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="pt-2 mt-2 border-t border-emerald-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Total:</span>
                                            <span className="text-xl font-bold text-emerald-600">
                                                ₹{formData.items.reduce((sum, item) =>
                                                    sum + parseFloat(calculateFinalPrice(item.price, item.discount)), 0
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition flex items-center gap-2"
                            >
                                {editingId ? "Update Agreement" : "Create Agreement"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomerItem;