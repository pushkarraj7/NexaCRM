import { useState } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

const Orders = () => {
  const [showModal, setShowModal] = useState(false);

  const [orders, setOrders] = useState([
    {
      id: "ORD-001",
      customer: "ABC Dairy",
      item: "Milk Can 50L",
      quantity: 10,
      amount: "₹25,000",
      status: "pending",
      date: "2024-03-01",
    },
    {
      id: "ORD-002",
      customer: "XYZ Milk",
      item: "Butter Pack",
      quantity: 50,
      amount: "₹40,000",
      status: "completed",
      date: "2024-03-05",
    },
  ]);

  const [newOrder, setNewOrder] = useState({
    customer: "",
    item: "",
    quantity: "",
    amount: "",
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
                Orders
              </h1>
              <p className="text-gray-600 mt-1">Track and manage customer orders</p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Order
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Item</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Qty</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-gray-600">{order.customer}</td>
                    <td className="px-6 py-4 text-gray-600">{order.item}</td>
                    <td className="px-6 py-4 text-gray-600">{order.quantity}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                          }`}
                      >
                        {order.status}
                      </span>
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
              <h2 className="text-2xl font-bold text-gray-900">Add New Order</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter order details
              </p>
            </div>

            <div className="px-8 py-6 space-y-4">
              <input
                placeholder="Customer Name"
                value={newOrder.customer}
                onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
              />

              <input
                placeholder="Item Name"
                value={newOrder.item}
                onChange={(e) => setNewOrder({ ...newOrder, item: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
              />

              <input
                type="number"
                placeholder="Quantity"
                value={newOrder.quantity}
                onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
              />

              <input
                placeholder="Amount"
                value={newOrder.amount}
                onChange={(e) => setNewOrder({ ...newOrder, amount: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
              />
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
                  setOrders([
                    ...orders,
                    {
                      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
                      ...newOrder,
                      status: "pending",
                      date: new Date().toISOString().split("T")[0],
                    },
                  ]);
                  setShowModal(false);
                  setNewOrder({ customer: "", item: "", quantity: "", amount: "" });
                }}
                className="px-6 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
              >
                Save Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;