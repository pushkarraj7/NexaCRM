import { useState } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

const Items = () => {
  const [showModal, setShowModal] = useState(false);

  const [items, setItems] = useState([
    {
      id: 1,
      name: "Full Cream Milk",
      description: "High quality full cream milk",
      price: 60,
    },
    {
      id: 2,
      name: "Toned Milk",
      description: "Low fat toned milk",
      price: 50,
    },
  ]);

  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="flex min-h-screen">
        <Sidebar className="h-full" />
        
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Items
              </h1>
              <p className="text-gray-600 mt-1">Manage your product catalog</p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Item
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Price (₹)</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ₹{item.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

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
              <div>
                <label className="text-sm font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                  placeholder="Milk"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none resize-none"
                  placeholder="Item description"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setItems([
                    ...items,
                    {
                      id: items.length + 1,
                      ...newItem,
                      price: Number(newItem.price),
                    },
                  ]);
                  setShowModal(false);
                  setNewItem({ name: "", description: "", price: "" });
                }}
                className="px-6 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;