"use client";
import { useState } from "react";
import SidebarDashboard from "../dashboards/SidebarDashboard";

const DashboardContainer = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <section>
      <div className="container-fluid-2">
        <div className="pt-4 pb-2">
          {/* Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center justify-center w-10 h-10 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primaryColor transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100 shadow-sm"
            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${isSidebarOpen ? "rotate-0" : "rotate-180"}`}
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={`grid grid-cols-1 gap-30px pb-100px ${isSidebarOpen ? "lg:grid-cols-12" : ""}`}>
          {isSidebarOpen && (
            <div className="lg:col-start-1 lg:col-span-3 transition-opacity duration-300">
              <SidebarDashboard />
            </div>
          )}
          <div className={`${isSidebarOpen ? "lg:col-start-4 lg:col-span-9" : "w-full"} transition-all duration-300`}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardContainer;
