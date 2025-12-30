import { useState, useEffect, useRef } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

const Items = () => {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unitOpen, setUnitOpen] = useState(false);
  const unitDropdownRef = useRef(null);


  const unitOptions = [
    { label: "Kilogram (kg)", value: "kg" },
    { label: "Gram (g)", value: "g" },
    { label: "Litre (ltr)", value: "ltr" },
    { label: "Millilitre (ml)", value: "ml" },
    { label: "Piece (pcs)", value: "pcs" },
    { label: "Box", value: "box" },
    { label: "Packet", value: "packet" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        unitDropdownRef.current &&
        !unitDropdownRef.current.contains(event.target)
      ) {
        setUnitOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    unit: "kg",
    quantity: "",
    mrp: "",
    hsnCode: "",
    tax: "",
    itemCode: "",
    itemCategory: "",
  });

  const [editItem, setEditItem] = useState({
    itemCode: "",
    itemCategory: "",
    name: "",
    unit: "kg",
    quantity: "",
    mrp: "",
    hsnCode: "",
    tax: "",
  });

  const [editUnitOpen, setEditUnitOpen] = useState(false);
  const editUnitDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        editUnitDropdownRef.current &&
        !editUnitDropdownRef.current.contains(event.target)
      ) {
        setEditUnitOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch items from backend
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/items', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Create item
  const handleCreateItem = async () => {
    setError("");
    setLoading(true);

    // ✅ FIXED: Check for NEW fields
    if (!newItem.itemCode || !newItem.itemCategory || !newItem.name ||
      !newItem.unit || !newItem.quantity || !newItem.mrp ||
      !newItem.hsnCode || !newItem.tax) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        // ✅ FIXED: Send NEW fields
        body: JSON.stringify({
          itemCode: newItem.itemCode,
          itemCategory: newItem.itemCategory,
          name: newItem.name,
          unit: newItem.unit,
          quantity: Number(newItem.quantity),
          mrp: Number(newItem.mrp),
          hsnCode: newItem.hsnCode,
          tax: Number(newItem.tax),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setItems([data, ...items]);
        setShowModal(false);
        // ✅ FIXED: Reset NEW fields
        setNewItem({
          name: "",
          unit: "kg",
          quantity: "",
          mrp: "",
          hsnCode: "",
          tax: "",
          itemCode: "",
          itemCategory: "",
        });
        setError("");
        alert("Item created successfully!");
      } else {
        setError(data.message || 'Failed to create item');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Error creating item:', error);
    } finally {
      setLoading(false);
    }
  };

  // Edit item
  const handleEditItem = (item) => {
    setSelectedItem(item);
    // ✅ FIXED: Set NEW fields
    setEditItem({
      itemCode: item.itemCode,
      itemCategory: item.itemCategory,
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      mrp: item.mrp,
      hsnCode: item.hsnCode,
      tax: item.tax,
    });
    setEditModal(true);
  };

  // Update item
  const handleUpdateItem = async () => {
    setError("");
    setLoading(true);

    // ✅ FIXED: Check for NEW fields
    if (!editItem.itemCode || !editItem.itemCategory || !editItem.name ||
      !editItem.unit || !editItem.quantity || !editItem.mrp ||
      !editItem.hsnCode || editItem.tax === undefined) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/items/${selectedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        // ✅ FIXED: Send NEW fields
        body: JSON.stringify({
          itemCode: editItem.itemCode,
          itemCategory: editItem.itemCategory,
          name: editItem.name,
          unit: editItem.unit,
          quantity: Number(editItem.quantity),
          mrp: Number(editItem.mrp),
          hsnCode: editItem.hsnCode,
          tax: Number(editItem.tax),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setItems(items.map(item =>
          item._id === selectedItem._id ? data : item
        ));
        setEditModal(false);
        setSelectedItem(null);
        setError("");
        alert("Item updated successfully!");
      } else {
        setError(data.message || 'Failed to update item');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Error updating item:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const handleDeleteItem = (item) => {
    setSelectedItem(item);
    setDeleteModal(true);
  };

  // Confirm delete
  const confirmDeleteItem = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/items/${selectedItem._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setItems(items.filter(item => item._id !== selectedItem._id));
        setDeleteModal(false);
        setSelectedItem(null);
        alert("Item deleted successfully!");
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete item');
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
      console.error('Error deleting item:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="flex min-h-screen">
        <Sidebar className="h-full" />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">

          {/* <div className="flex justify-between items-center mb-8"> */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Items
              </h1>
              <p className="text-gray-600 mt-1">Manage your product catalog</p>
            </div>

            {/* <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Item
            </button> */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Field */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search items..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                  />
                </svg>
              </div>

              {/* Add Item Button */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Item
              </button>
            </div>

          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Unit</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">MRP (₹)</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">HSN Code</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Tax %</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Item Code</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {/* {items.length === 0 ? ( */}
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">No items found</p>
                          <p className="text-sm text-gray-400">Add your first item to get started</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // items.map((item) => (
                  filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{item.unit}</td>
                      <td className="px-6 py-4 text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-gray-900">₹{item.mrp}</td>
                      <td className="px-6 py-4 text-gray-900">{item.hsnCode}</td>
                      <td className="px-6 py-4 text-gray-900">{item.tax}%</td>
                      <td className="px-6 py-4 text-gray-900">{item.itemCode}</td>
                      <td className="px-6 py-4 text-gray-900">{item.itemCategory}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Item"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Item"
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
        </main>
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl border border-gray-200 transform transition-all duration-300 scale-100">
            <div className="px-8 pt-8 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add New Item</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter item details
              </p>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Item Code</label>
                  <input
                    type="text"
                    value={newItem.itemCode}
                    onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })}
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="ITEM001"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Item Category</label>
                  <input
                    type="text"
                    value={newItem.itemCategory}
                    onChange={(e) => setNewItem({ ...newItem, itemCategory: e.target.value })}
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="Dairy"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Item Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="Full Cream Milk"
                  />
                </div>

                <div ref={unitDropdownRef} className="relative w-full">
                  <label className="text-sm font-medium text-gray-700">Unit</label>
                  <button
                    type="button"
                    onClick={() => setUnitOpen((prev) => !prev)}
                    className="mt-1 w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                  >
                    <span className={`text-sm ${newItem.unit ? "text-gray-900" : "text-gray-400"}`}>
                      {newItem.unit
                        ? unitOptions.find((u) => u.value === newItem.unit)?.label
                        : "Select Unit"}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${unitOpen ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {unitOpen && (
                    <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                      {unitOptions.map((item) => (
                        <button
                          key={item.value}
                          onClick={() => {
                            setNewItem({ ...newItem, unit: item.value });
                            setUnitOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition ${newItem.unit === item.value
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

                <div>
                  <label className="text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">MRP (₹)</label>
                  <input
                    type="number"
                    value={newItem.mrp}
                    onChange={(e) => setNewItem({ ...newItem, mrp: e.target.value })}
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">HSN Code</label>
                  <input
                    type="text"
                    value={newItem.hsnCode}
                    onChange={(e) => setNewItem({ ...newItem, hsnCode: e.target.value })}
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="1234"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Tax (%)</label>
                  <input
                    type="number"
                    value={newItem.tax}
                    onChange={(e) => setNewItem({ ...newItem, tax: e.target.value })}
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="18"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                  setNewItem({
                    name: "",
                    unit: "kg",
                    quantity: "",
                    mrp: "",
                    hsnCode: "",
                    tax: "",
                    itemCode: "",
                    itemCategory: "",
                  });
                }}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                onClick={handleCreateItem}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  'Add Item'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditModal(false)}
          />

          <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl border border-gray-200">
            <div className="px-8 pt-8 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Item</h2>
              <p className="text-sm text-gray-500 mt-1">
                Update item details
              </p>
            </div>

            <div className="px-8 py-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Item Code</label>
                  <input
                    type="text"
                    value={editItem.itemCode}
                    onChange={(e) =>
                      setEditItem({ ...editItem, itemCode: e.target.value })
                    }
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Item Category</label>
                  <input
                    type="text"
                    value={editItem.itemCategory}
                    onChange={(e) =>
                      setEditItem({ ...editItem, itemCategory: e.target.value })
                    }
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Item Name</label>
                  <input
                    type="text"
                    value={editItem.name}
                    onChange={(e) =>
                      setEditItem({ ...editItem, name: e.target.value })
                    }
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                  />
                </div>

                {/* Unit Dropdown */}
                <div ref={editUnitDropdownRef} className="relative w-full">
                  <label className="text-sm font-medium text-gray-700">Unit</label>
                  <button
                    type="button"
                    onClick={() => setEditUnitOpen((prev) => !prev)}
                    className="mt-1 w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                  >
                    <span className="text-sm">
                      {unitOptions.find((u) => u.value === editItem.unit)?.label}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${editUnitOpen ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {editUnitOpen && (
                    <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                      {unitOptions.map((item) => (
                        <button
                          key={item.value}
                          onClick={() => {
                            setEditItem({ ...editItem, unit: item.value });
                            setEditUnitOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition ${editItem.unit === item.value
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

                <div>
                  <label className="text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    value={editItem.quantity}
                    onChange={(e) =>
                      setEditItem({ ...editItem, quantity: e.target.value })
                    }
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">MRP (₹)</label>
                  <input
                    type="number"
                    value={editItem.mrp}
                    onChange={(e) =>
                      setEditItem({ ...editItem, mrp: e.target.value })
                    }
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">HSN Code</label>
                  <input
                    type="text"
                    value={editItem.hsnCode}
                    onChange={(e) =>
                      setEditItem({ ...editItem, hsnCode: e.target.value })
                    }
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Tax (%)</label>
                  <input
                    type="number"
                    value={editItem.tax}
                    onChange={(e) =>
                      setEditItem({ ...editItem, tax: e.target.value })
                    }
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                  />
                </div>
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
                onClick={handleUpdateItem}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Modal */}
      {deleteModal && selectedItem && (
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
              <h2 className="text-2xl font-bold text-gray-900">Delete Item</h2>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedItem.name}</span>? This action cannot be undone.
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
                onClick={confirmDeleteItem}
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
                  'Delete Item'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Items;