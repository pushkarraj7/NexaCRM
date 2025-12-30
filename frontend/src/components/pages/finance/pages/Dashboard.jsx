import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const FinanceDashboard = () => {

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="flex min-h-screen">
        <Sidebar className="h-full" />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Finance Dashboard</h2>
        </main>
      </div>
    </div>
  );
};


export default FinanceDashboard;
