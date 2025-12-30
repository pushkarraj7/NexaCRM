import { useEffect, useRef, useState } from "react";

// Topbar Component
const Topbar = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, message: "New order placed", time: "2 min ago", read: false },
        { id: 2, message: "Order shipped", time: "10 min ago", read: false },
        { id: 3, message: "Agreement approved", time: "1 hour ago", read: true },
    ]);

    const markAsRead = (id) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, read: true } : n
            )
        );
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">
                                    Customer Portal
                                </h1>
                                <p className="text-xs text-gray-500">Customer Management Dashboard</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 min-w-[280px] border border-gray-200 focus-within:border-gray-900 focus-within:bg-white transition-all">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                            />
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications((prev) => !prev)}
                                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>

                                {notifications.some((n) => !n.read) && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                        <p className="font-semibold text-gray-900 text-sm">Notifications</p>
                                        <button
                                            onClick={() =>
                                                setNotifications((prev) =>
                                                    prev.map((n) => ({ ...n, read: true }))
                                                )
                                            }
                                            className="text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                        >
                                            Mark all read
                                        </button>
                                    </div>

                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => markAsRead(item.id)}
                                                className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0
                                                    ${item.read ? "bg-white" : "bg-gray-50"}
                                                    hover:bg-gray-100`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm text-gray-800">{item.message}</p>
                                                    {!item.read && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium text-gray-900">Customer User</p>
                                <p className="text-xs text-gray-500">Customer</p>
                            </div>
                            <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:bg-gray-800 transition-colors">
                                C
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Topbar;