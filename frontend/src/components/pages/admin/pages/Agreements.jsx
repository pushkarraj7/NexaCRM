import { useState, useEffect, useRef } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const Agreements = () => {
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [partyDropdownOpen, setPartyDropdownOpen] = useState(false);
  const partyDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (partyDropdownRef.current && !partyDropdownRef.current.contains(event.target)) {
        setPartyDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/customers", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch customers");

      const data = await response.json();
      setCustomers(data); // your backend returns an array of customers
    } catch (err) {
      console.error(err);
    }
  };

  const [newAgreement, setNewAgreement] = useState({
    party: "",
    type: "",
    startDate: null, // use null for DatePicker
    endDate: null,
    amount: "",
  });


  // Fetch agreements from backend
  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/agreements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agreements');
      }

      const data = await response.json();
      setAgreements(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching agreements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgreement = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/agreements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAgreement),
      });

      if (!response.ok) {
        throw new Error('Failed to create agreement');
      }

      const data = await response.json();

      // Refresh the list
      fetchAgreements();

      setShowModal(false);
      setNewAgreement({ party: "", type: "", startDate: "", endDate: "", amount: "" });
    } catch (err) {
      alert('Error creating agreement: ' + err.message);
      console.error('Error:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Topbar />
        <div className="flex min-h-screen">
          <Sidebar className="h-full" />
          <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading agreements...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Filter agreements based on search query (case-insensitive)
  const filteredAgreements = agreements.filter(
    (agreement) =>
      agreement.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agreement.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agreement.agreementId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="flex min-h-screen">
        <Sidebar className="h-full" />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">

          {/* <div className="flex justify-between items-center mb-8"> */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Agreements
              </h1>
              <p className="text-gray-600 mt-1">Manage all legal agreements</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search Field Wrapper */}
              <div className="relative flex-1 md:flex-none">
                <input
                  type="text"
                  placeholder="Search agreements..."
                  className="w-full px-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* Search Icon */}
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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

              {/* Add Agreement Button */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Agreement
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">Error: {error}</p>
              <button
                onClick={fetchAgreements}
                className="mt-2 text-sm text-red-700 underline"
              >
                Try again
              </button>
            </div>
          )}

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
                {filteredAgreements.length > 0 ? (
                  // Sort by agreementId descending
                  filteredAgreements
                    .sort((a, b) => {
                      // If agreementId is numeric
                      // return b.agreementId - a.agreementId;

                      // If agreementId is string (lexicographical)
                      return b.agreementId.localeCompare(a.agreementId);
                    })
                    .map((agreement) => (
                      <tr key={agreement._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">{agreement.agreementId}</td>
                        <td className="px-6 py-4 text-gray-600">{agreement.party}</td>
                        <td className="px-6 py-4 text-gray-600">{agreement.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(agreement.startDate)} → {formatDate(agreement.endDate)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${agreement.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : agreement.status === "expired"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                          >
                            {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedAgreement(agreement);
                              setShowView(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium transition"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No agreements found. Click "Add Agreement" to create one.
                    </td>
                  </tr>
                )}
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

              {/* Party Name */}
              <div className="relative w-full" ref={partyDropdownRef} onClick={(e) => e.stopPropagation()}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Party Name</label>

                <button
                  type="button"
                  onClick={() => setPartyDropdownOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                >
                  <span className="capitalize text-sm">
                    {newAgreement.party ? newAgreement.party : "Select a customer"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${partyDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {partyDropdownOpen && (
                  <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
                    {customers.map((customer) => (
                      <button
                        key={customer._id}
                        onClick={() => {
                          setNewAgreement({ ...newAgreement, party: customer.name });
                          setPartyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition ${newAgreement.party === customer.name
                          ? "bg-gray-900 text-white font-medium"
                          : "hover:bg-gray-50 text-gray-700"
                          }`}
                      >
                        {customer.name} ({customer.email})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Agreement Type */}
              <input
                placeholder="Agreement Type (e.g., Supply, Purchase)"
                value={newAgreement.type}
                onChange={(e) => setNewAgreement({ ...newAgreement, type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
              />

              {/* Date Pickers for Start and End Date */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Start Date */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <DatePicker
                    selected={newAgreement.startDate}
                    onChange={(date) => setNewAgreement({ ...newAgreement, startDate: date })}
                    placeholderText="Select start date"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    calendarClassName="custom-datepicker"
                    dateFormat="dd/MM/yyyy"
                  />

                </div>

                {/* End Date */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <DatePicker
                    selected={newAgreement.endDate}
                    onChange={(date) => setNewAgreement({ ...newAgreement, endDate: date })}
                    placeholderText="Select end date"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    dateFormat="dd/MM/yyyy"
                    minDate={newAgreement.startDate} // cannot select before start date
                    calendarClassName="custom-datepicker" // apply black-themed calendar
                  />
                </div>

              </div>

              {/* Amount */}
              <input
                placeholder="Amount (e.g., ₹5,00,000)"
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
                onClick={handleCreateAgreement}
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
                  <p className="text-sm text-gray-500">{selectedAgreement.agreementId}</p>
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
              <div className="px-8 py-4 space-y-8 bg-white">

                {/* Document Header */}
                <div className="text-center border-b border-gray-300 pb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">AGREEMENT DOCUMENT</h1>
                  <p className="text-sm text-gray-500 uppercase tracking-wider">
                    Reference: {selectedAgreement.agreementId}
                  </p>
                </div>

                {/* Agreement Details Section - 3 items per row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Party Name</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedAgreement.party}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Agreement Type</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedAgreement.type}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Start Date</p>
                    <p className="text-base font-medium text-gray-900">{formatDate(selectedAgreement.startDate)}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">End Date</p>
                    <p className="text-base font-medium text-gray-900">{formatDate(selectedAgreement.endDate)}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedAgreement.amount}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${selectedAgreement.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : selectedAgreement.status === "expired"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {selectedAgreement.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="border-t border-gray-300 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
                  <ul className="list-decimal list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
                    <li>This agreement is entered into between the parties as of the start date mentioned above.</li>
                    <li>Both parties agree to fulfill their obligations as per the terms specified in this document.</li>
                    <li>The agreement shall remain valid until the end date unless terminated earlier by mutual consent.</li>
                    <li>Any modifications to this agreement must be made in writing and signed by both parties.</li>
                  </ul>
                </div>

                {/* Signatures */}
                <div className="border-t border-gray-300 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Party Signature</p>
                      <div className="border-t-2 border-gray-400 pt-2 mt-8">
                        <p className="text-sm text-gray-600">Authorized Signatory</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Company Signature</p>
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
                  onClick={() => window.print()}
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