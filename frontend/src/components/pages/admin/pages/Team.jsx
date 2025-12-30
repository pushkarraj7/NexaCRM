import { useState } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

const AdminTeam = () => {

    return (
        <div className="min-h-screen bg-gray-50">
            <Topbar />

            <div className="flex min-h-screen">
                <Sidebar className="h-full" />

                <main className="flex-1 p-6 lg:p-8 overflow-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Internal Team Members
                    </h1>
                    <p className="text-gray-600">Manage your organization's internal team members here.</p>
                </main>
            </div>
        </div>
    );
}

export default AdminTeam;