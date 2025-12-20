import { useState } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

const Agreements = () => {
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);

  const [agreements, setAgreements] = useState([
    {
      id: "AGR-001",
      party: "ABC Dairy",
      type: "Supply",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      status: "active",
      amount: "₹5,00,000",
    },
    {
      id: "AGR-002",
      party: "XYZ Milk",
      type: "Purchase",
      startDate: "2023-06-01",
      endDate: "2024-05-31",
      status: "expired",
      amount: "₹3,20,000",
    },
  ]);

  const [newAgreement, setNewAgreement] = useState({
    party: "",
    type: "",
    startDate: "",
    endDate: "",
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
                Agreements
              </h1>
              <p className="text-gray-600 mt-1">Manage all legal agreements</p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg> Add Agreement
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Party</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Validity</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {agreements.map((agr) => (
                  <tr key={agr.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{agr.id}</td>
                    <td className="px-6 py-4 text-gray-600">{agr.party}</td>
                    <td className="px-6 py-4 text-gray-600">{agr.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {agr.startDate} → {agr.endDate}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${agr.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {agr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedAgreement(agr);
                          setShowView(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        View
                      </button>
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
              <h2 className="text-2xl font-bold text-gray-900">Add Agreement</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter agreement details
              </p>
            </div>

            <div className="px-8 py-6 space-y-4">
              <input
                placeholder="Party Name"
                value={newAgreement.party}
                onChange={(e) => setNewAgreement({ ...newAgreement, party: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
              />

              <input
                placeholder="Agreement Type"
                value={newAgreement.type}
                onChange={(e) => setNewAgreement({ ...newAgreement, type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
              />

              <input
                type="date"
                value={newAgreement.startDate}
                onChange={(e) => setNewAgreement({ ...newAgreement, startDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
              />

              <input
                type="date"
                value={newAgreement.endDate}
                onChange={(e) => setNewAgreement({ ...newAgreement, endDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
              />

              <input
                placeholder="Amount"
                value={newAgreement.amount}
                onChange={(e) => setNewAgreement({ ...newAgreement, amount: e.target.value })}
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
                  setAgreements([
                    ...agreements,
                    {
                      id: `AGR-${String(agreements.length + 1).padStart(3, '0')}`,
                      ...newAgreement,
                      status: "active",
                    },
                  ]);
                  setShowModal(false);
                  setNewAgreement({ party: "", type: "", startDate: "", endDate: "", amount: "" });
                }}
                className="px-6 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showView && selectedAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowView(false)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-hidden flex flex-col">
            {/* PDF-style Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Agreement Document</h2>
                  <p className="text-sm text-gray-500">{selectedAgreement.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowView(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* PDF-style Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-8 bg-white">
                {/* Document Header */}
                <div className="text-center border-b border-gray-300 pb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">AGREEMENT DOCUMENT</h1>
                  <p className="text-sm text-gray-500 uppercase tracking-wider">Reference: {selectedAgreement.id}</p>
                </div>

                {/* Agreement Details Section */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Party Name</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedAgreement.party}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Agreement Type</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedAgreement.type}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Start Date</p>
                      <p className="text-base font-medium text-gray-900">{selectedAgreement.startDate}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">End Date</p>
                      <p className="text-base font-medium text-gray-900">{selectedAgreement.endDate}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedAgreement.amount}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Status</p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${selectedAgreement.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {selectedAgreement.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terms Section */}
                <div className="border-t border-gray-300 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
                  <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
                    <p>1. This agreement is entered into between the parties as of the start date mentioned above.</p>
                    <p>2. Both parties agree to fulfill their obligations as per the terms specified in this document.</p>
                    <p>3. The agreement shall remain valid until the end date unless terminated earlier by mutual consent.</p>
                    <p>4. Any modifications to this agreement must be made in writing and signed by both parties.</p>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="border-t border-gray-300 pt-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Party Signature</p>
                      <div className="border-t-2 border-gray-400 pt-2 mt-8">
                        <p className="text-sm text-gray-600">Authorized Signatory</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Company Signature</p>
                      <div className="border-t-2 border-gray-400 pt-2 mt-8">
                        <p className="text-sm text-gray-600">Authorized Signatory</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF-style Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500">Document generated on {new Date().toLocaleDateString()}</p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
                  onClick={() => alert('Print functionality')}
                >
                  Print
                </button>
                <button
                  onClick={() => setShowView(false)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Agreements;